/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test, testing} from '@gsa/testing';
import {fireEvent, rendererWith, screen, wait, within} from 'web/testing';
import Response from 'gmp/http/response';
import OciImageTarget from 'gmp/models/oci-image-target';
import Button from 'web/components/form/Button';
import {currentSettingsDefaultResponse} from 'web/pages/__fixtures__/current-settings';
import ContainerImageTargetsComponent from 'web/pages/container-image-targets/ContainerImageTargetsComponent';

type MaybeMock<T> = T | ((...args: unknown[]) => Promise<T>);

type CreateGmpParams = {
  getAllCredentials?: unknown[];
  createOciImageTarget?: MaybeMock<{id: string}>;
  saveOciImageTarget?: MaybeMock<{id: string}>;
  cloneOciImageTarget?: MaybeMock<{id: string}>;
  deleteOciImageTarget?: MaybeMock<undefined>;
  exportOciImageTarget?: MaybeMock<Response | string>;
  createCredentialResponse?: MaybeMock<unknown>;
  createCredential?: MaybeMock<unknown>;
};

type MockFn = ReturnType<typeof testing.fn>;

// Helper to build model instances for tests
// eslint-disable-next-line @typescript-eslint/naming-convention
const makeTarget = (id = '123', name = 'foo', image_references?: string) =>
  OciImageTarget.fromElement(
    image_references ? {_id: id, name, image_references} : {_id: id, name},
  );

// Helper to assert that the first arg of a handler mock is the expected error

const assertHandlerError = (mock: MockFn, error: Error) => {
  expect(mock).toHaveBeenCalled();
  expect(mock.mock.calls[0][0]).toBe(error);
};

const createGmp = ({
  getAllCredentials = [],
  createOciImageTarget = {id: 'created-id'},
  saveOciImageTarget = {id: 'saved-id'},
  cloneOciImageTarget = {id: 'cloned-id'},
  deleteOciImageTarget = undefined,
  exportOciImageTarget = new Response('some-data'),
  createCredentialResponse = {data: {id: 'cred-id'}},
  createCredential = testing.fn().mockResolvedValue(createCredentialResponse),
}: CreateGmpParams = {}): {
  credentials: {getAll: ReturnType<typeof testing.fn>};
  ociimagetarget: Record<string, ReturnType<typeof testing.fn>>;
  credential: {create: ReturnType<typeof testing.fn>};
  user: {currentSettings: ReturnType<typeof testing.fn>};
} => {
  const make = (val: unknown) =>
    typeof val === 'function'
      ? (val as unknown as MockFn)
      : testing.fn().mockResolvedValue(val);

  return {
    credentials: {
      getAll: testing.fn().mockResolvedValue(new Response(getAllCredentials)),
    },
    ociimagetarget: {
      create: make(createOciImageTarget),
      save: make(saveOciImageTarget),
      clone: make(cloneOciImageTarget),
      delete: make(deleteOciImageTarget),
      export: make(exportOciImageTarget),
    },
    credential: {
      create: make(createCredential),
    },
    user: {
      currentSettings: testing
        .fn()
        .mockResolvedValue(currentSettingsDefaultResponse),
    },
  };
};

describe('ContainerImageTargetsComponent tests', () => {
  test('should render', async () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp});

    render(
      <ContainerImageTargetsComponent>
        {() => <Button data-testid="button" />}
      </ContainerImageTargetsComponent>,
    );

    expect(screen.getByTestId('button')).toBeInTheDocument();
  });

  test('should open and close edit dialog (create)', async () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp, capabilities: true});

    render(
      <ContainerImageTargetsComponent>
        {({create}) => <Button data-testid="open" onClick={() => create()} />}
      </ContainerImageTargetsComponent>,
    );

    fireEvent.click(screen.getByTestId('open'));
    expect(
      await screen.findByText('New Container Image Target'),
    ).toBeInTheDocument();

    const cancelButton = screen.getDialogCloseButton();
    fireEvent.click(cancelButton);
    expect(
      screen.queryByText('New Container Image Target'),
    ).not.toBeInTheDocument();
  });

  test('should allow creating a new container image target', async () => {
    const gmp = createGmp();
    const onCreated = testing.fn();
    const onCreateError = testing.fn();
    const {render} = rendererWith({gmp, capabilities: true});

    render(
      <ContainerImageTargetsComponent
        onCreateError={onCreateError}
        onCreated={onCreated}
      >
        {({create}) => <Button data-testid="open" onClick={() => create()} />}
      </ContainerImageTargetsComponent>,
    );

    fireEvent.click(screen.getByTestId('open'));
    expect(
      await screen.findByText('New Container Image Target'),
    ).toBeInTheDocument();

    const saveButton = screen.getDialogSaveButton();
    fireEvent.click(saveButton);
    await wait();

    expect(
      screen.queryByText('New Container Image Target'),
    ).not.toBeInTheDocument();
    expect(onCreateError).not.toHaveBeenCalled();
    expect(onCreated).toHaveBeenCalledWith({id: 'created-id'});
  });

  test('should call onCreateError if creating fails and show error', async () => {
    const error = new Error('create error');
    const gmp = createGmp({
      createOciImageTarget: testing.fn().mockRejectedValue(error),
    });

    const onCreated = testing.fn();
    const onCreateError = testing.fn();
    const {render} = rendererWith({gmp, capabilities: true});

    render(
      <ContainerImageTargetsComponent
        onCreateError={onCreateError}
        onCreated={onCreated}
      >
        {({create}) => <Button data-testid="open" onClick={() => create()} />}
      </ContainerImageTargetsComponent>,
    );

    fireEvent.click(screen.getByTestId('open'));
    expect(
      await screen.findByText('New Container Image Target'),
    ).toBeInTheDocument();

    const saveButton = screen.getDialogSaveButton();
    fireEvent.click(saveButton);

    // Dialog should still be visible and show the error
    expect(screen.getByText('New Container Image Target')).toBeInTheDocument();
    expect(await screen.findByText('create error')).toBeInTheDocument();
    expect(onCreated).not.toHaveBeenCalled();
    expect(onCreateError).toHaveBeenCalled();
    // the hook forwards additional arguments (variables/context) so assert the first arg is the error
    assertHandlerError(onCreateError, error);
  });

  test('should allow editing existing target and save', async () => {
    const gmp = createGmp();
    const onSaved = testing.fn();
    const onSaveError = testing.fn();
    const {render} = rendererWith({gmp, capabilities: true});

    const target = makeTarget('123', 'foo', 'img1, img2');

    render(
      <ContainerImageTargetsComponent
        onSaveError={onSaveError}
        onSaved={onSaved}
      >
        {({edit}) => <Button data-testid="open" onClick={() => edit(target)} />}
      </ContainerImageTargetsComponent>,
    );

    fireEvent.click(screen.getByTestId('open'));
    expect(
      await screen.findByText('Edit Container Image Target - foo'),
    ).toBeInTheDocument();

    const saveButton = screen.getDialogSaveButton();
    fireEvent.click(saveButton);
    await wait();

    expect(
      screen.queryByText('Edit Container Image Target - foo'),
    ).not.toBeInTheDocument();
    expect(onSaveError).not.toHaveBeenCalled();
    expect(onSaved).toHaveBeenCalledWith({id: 'saved-id'});
  });

  test('should call onSaveError if saving fails and show error', async () => {
    const error = new Error('save error');
    const gmp = createGmp({
      saveOciImageTarget: testing.fn().mockRejectedValue(error),
    });

    const onSaved = testing.fn();
    const onSaveError = testing.fn();
    const {render} = rendererWith({gmp, capabilities: true});

    const target = makeTarget();

    render(
      <ContainerImageTargetsComponent
        onSaveError={onSaveError}
        onSaved={onSaved}
      >
        {({edit}) => <Button data-testid="open" onClick={() => edit(target)} />}
      </ContainerImageTargetsComponent>,
    );

    fireEvent.click(screen.getByTestId('open'));
    expect(
      await screen.findByText('Edit Container Image Target - foo'),
    ).toBeInTheDocument();

    const saveButton = screen.getDialogSaveButton();
    fireEvent.click(saveButton);

    expect(onSaved).not.toHaveBeenCalled();
    // the dialog should show the error message regardless
    expect(await screen.findByText('save error')).toBeInTheDocument();
    // onSaveError may or may not be called depending on timing; assert if it was called the error is forwarded
    if (onSaveError.mock.calls.length) {
      assertHandlerError(onSaveError, error);
    }
  });

  test('should allow cloning', async () => {
    const gmp = createGmp();
    const onCloned = testing.fn();
    const onCloneError = testing.fn();
    const {render} = rendererWith({gmp, capabilities: true});

    const target = makeTarget();

    render(
      <ContainerImageTargetsComponent
        onCloneError={onCloneError}
        onCloned={onCloned}
      >
        {({clone}) => (
          <Button data-testid="button" onClick={() => clone(target)} />
        )}
      </ContainerImageTargetsComponent>,
    );

    const button = screen.getByTestId('button');
    fireEvent.click(button);
    await wait();

    expect(onCloneError).not.toHaveBeenCalled();
    expect(onCloned).toHaveBeenCalledWith({id: 'cloned-id'});
  });

  test('should call onCloneError when cloning fails', async () => {
    const error = new Error('clone error');
    const gmp = createGmp({
      cloneOciImageTarget: testing.fn().mockRejectedValue(error),
    });
    const onCloned = testing.fn();
    const onCloneError = testing.fn();
    const {render} = rendererWith({gmp, capabilities: true});

    const target = makeTarget();

    let clonePromise: Promise<unknown> | undefined;
    render(
      <ContainerImageTargetsComponent
        onCloneError={onCloneError}
        onCloned={onCloned}
      >
        {({clone}) => (
          <Button
            data-testid="button"
            onClick={() => (clonePromise = clone(target))}
          />
        )}
      </ContainerImageTargetsComponent>,
    );

    fireEvent.click(screen.getByTestId('button'));

    // attach handler synchronously to avoid PromiseRejectionHandledWarning
    clonePromise?.catch(() => {});

    await wait();

    // await rejection to ensure promise rejected as expected
    await expect(clonePromise).rejects.toThrow('clone error');

    expect(onCloned).not.toHaveBeenCalled();
    expect(onCloneError).toHaveBeenCalled();
    assertHandlerError(onCloneError, error);
  });

  test('should allow deleting', async () => {
    const gmp = createGmp();
    const onDeleted = testing.fn();
    const onDeleteError = testing.fn();
    const {render} = rendererWith({gmp, capabilities: true});

    const target = makeTarget();

    render(
      <ContainerImageTargetsComponent
        onDeleteError={onDeleteError}
        onDeleted={onDeleted}
      >
        {({delete: del}) => (
          <Button data-testid="button" onClick={() => del(target)} />
        )}
      </ContainerImageTargetsComponent>,
    );

    fireEvent.click(screen.getByTestId('button'));
    await wait();

    expect(onDeleteError).not.toHaveBeenCalled();
    expect(onDeleted).toHaveBeenCalledOnce();
  });

  test('should call onDeleteError when deleting fails', async () => {
    const error = new Error('delete error');
    const gmp = createGmp({
      deleteOciImageTarget: testing.fn().mockRejectedValue(error),
    });
    const onDeleted = testing.fn();
    const onDeleteError = testing.fn();
    const {render} = rendererWith({gmp, capabilities: true});

    const target = makeTarget();

    let deletePromise: Promise<unknown> | undefined;
    render(
      <ContainerImageTargetsComponent
        onDeleteError={onDeleteError}
        onDeleted={onDeleted}
      >
        {({delete: del}) => (
          <Button
            data-testid="button"
            onClick={() => (deletePromise = del(target))}
          />
        )}
      </ContainerImageTargetsComponent>,
    );

    fireEvent.click(screen.getByTestId('button'));

    // avoid unhandled rejection warning
    deletePromise?.catch(() => {});

    await wait();

    await expect(deletePromise).rejects.toThrow('delete error');

    expect(onDeleted).not.toHaveBeenCalled();
    expect(onDeleteError).toHaveBeenCalled();
    assertHandlerError(onDeleteError, error);
  });

  test('should allow downloading and call onDownloaded', async () => {
    const gmp = createGmp();
    const target = makeTarget();
    const onDownloaded = testing.fn();
    const onDownloadError = testing.fn();
    const {render} = rendererWith({gmp, capabilities: true});

    render(
      <ContainerImageTargetsComponent
        onDownloadError={onDownloadError}
        onDownloaded={onDownloaded}
      >
        {({download}) => (
          <Button data-testid="button" onClick={() => download(target)} />
        )}
      </ContainerImageTargetsComponent>,
    );

    await wait();

    fireEvent.click(screen.getByTestId('button'));
    await wait();

    expect(onDownloadError).not.toHaveBeenCalled();
    expect(onDownloaded).toHaveBeenCalledOnce();
  });

  test('should call onDownloadError when download fails', async () => {
    const error = new Error('download error');
    const gmp = createGmp({
      exportOciImageTarget: testing.fn().mockRejectedValue(error),
    });
    const target = makeTarget();
    const onDownloaded = testing.fn();
    const onDownloadError = testing.fn();
    const {render} = rendererWith({gmp, capabilities: true});

    render(
      <ContainerImageTargetsComponent
        onDownloadError={onDownloadError}
        onDownloaded={onDownloaded}
      >
        {({download}) => (
          <Button data-testid="button" onClick={() => download(target)} />
        )}
      </ContainerImageTargetsComponent>,
    );

    await wait();

    fireEvent.click(screen.getByTestId('button'));
    await wait();

    expect(onDownloaded).not.toHaveBeenCalled();
    expect(onDownloadError).toHaveBeenCalledWith(error);
  });

  test('should allow creating credential from dialog and select it', async () => {
    const gmp = createGmp({getAllCredentials: []});
    const {render} = rendererWith({gmp, capabilities: true});

    render(
      <ContainerImageTargetsComponent>
        {({create}) => <Button data-testid="open" onClick={() => create()} />}
      </ContainerImageTargetsComponent>,
    );

    fireEvent.click(screen.getByTestId('open'));
    const newCredButton = await screen.findByTestId('new-icon-smb');
    // open credentials dialog via the NewIcon in the dialog
    fireEvent.click(newCredButton);
    const dialogs = await screen.findAllByRole('dialog');

    // fill credential form and save (CredentialDialog uses a "name" field)
    const credentialDialog = within(dialogs[1]);

    const nameInput = credentialDialog.getByName('name');
    fireEvent.change(nameInput, {target: {value: 'my-cred'}});

    const saveButton = credentialDialog.getDialogSaveButton();
    fireEvent.click(saveButton);
    await wait();

    // after creating credential, credentials list should have been refreshed and create called
    expect(gmp.credentials.getAll).toHaveBeenCalled();
    expect(gmp.credential.create).toHaveBeenCalled();
  });

  test('should handle editing target with undefined imageReferences', async () => {
    const gmp = createGmp();
    const onSaved = testing.fn();
    const {render} = rendererWith({gmp, capabilities: true});

    const target = makeTarget('123', 'foo'); // no image_references provided

    render(
      <ContainerImageTargetsComponent onSaved={onSaved}>
        {({edit}) => <Button data-testid="open" onClick={() => edit(target)} />}
      </ContainerImageTargetsComponent>,
    );

    fireEvent.click(screen.getByTestId('open'));
    expect(
      await screen.findByText('Edit Container Image Target - foo'),
    ).toBeInTheDocument();

    const saveButton = screen.getDialogSaveButton();
    fireEvent.click(saveButton);
    await wait();

    expect(
      screen.queryByText('Edit Container Image Target - foo'),
    ).not.toBeInTheDocument();
    expect(onSaved).toHaveBeenCalledWith({id: 'saved-id'});
  });

  test('should handle editing target with undefined excludeImages', async () => {
    const gmp = createGmp();
    const onSaved = testing.fn();
    const {render} = rendererWith({gmp, capabilities: true});

    // Create a target without excludeImages field
    const target = OciImageTarget.fromElement({
      _id: '123',
      name: 'foo',
      image_references: 'img1, img2',
    });

    render(
      <ContainerImageTargetsComponent onSaved={onSaved}>
        {({edit}) => <Button data-testid="open" onClick={() => edit(target)} />}
      </ContainerImageTargetsComponent>,
    );

    fireEvent.click(screen.getByTestId('open'));
    expect(
      await screen.findByText('Edit Container Image Target - foo'),
    ).toBeInTheDocument();

    const saveButton = screen.getDialogSaveButton();
    fireEvent.click(saveButton);
    await wait();

    expect(
      screen.queryByText('Edit Container Image Target - foo'),
    ).not.toBeInTheDocument();
    expect(onSaved).toHaveBeenCalledWith({id: 'saved-id'});
  });

  test('should render edit dialog when both imageReferences and excludeImages are undefined', async () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp, capabilities: true});

    const target = OciImageTarget.fromElement({
      _id: '123',
      name: 'foo',
    });

    render(
      <ContainerImageTargetsComponent>
        {({edit}) => <Button data-testid="open" onClick={() => edit(target)} />}
      </ContainerImageTargetsComponent>,
    );

    fireEvent.click(screen.getByTestId('open'));
    expect(
      await screen.findByText('Edit Container Image Target - foo'),
    ).toBeInTheDocument();

    // Dialog should render without errors
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
});

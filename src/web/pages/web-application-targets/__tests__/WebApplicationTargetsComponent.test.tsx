/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test, testing} from '@gsa/testing';
import {fireEvent, rendererWith, screen, wait} from 'web/testing';
import Response from 'gmp/http/response';
import WebApplicationTarget from 'gmp/models/web-application-target';
import {createSession} from 'gmp/testing';
import Button from 'web/components/form/Button';
import {currentSettingsDefaultResponse} from 'web/pages/__fixtures__/current-settings';
import WebApplicationTargetsComponent from 'web/pages/web-application-targets/WebApplicationTargetsComponent';

type MaybeMock<T> = T | ((...args: unknown[]) => Promise<T>);

type CreateGmpParams = {
  getAllCredentials?: unknown[];
  createWebApplicationTarget?: MaybeMock<{id: string}>;
  saveWebApplicationTarget?: MaybeMock<{id: string}>;
  cloneWebApplicationTarget?: MaybeMock<{id: string}>;
  deleteWebApplicationTarget?: MaybeMock<undefined>;
  exportWebApplicationTarget?: MaybeMock<Response | string>;
  createCredential?: MaybeMock<unknown>;
};

type MockFn = ReturnType<typeof testing.fn>;

const makeTarget = (id = '123', name = 'foo') =>
  WebApplicationTarget.fromElement({_id: id, name});

const assertHandlerError = (mock: MockFn, error: Error) => {
  expect(mock).toHaveBeenCalled();
  expect(mock.mock.calls[0][0]).toBe(error);
};

const createGmp = ({
  getAllCredentials = [],
  createWebApplicationTarget = {id: 'created-id'},
  saveWebApplicationTarget = {id: 'saved-id'},
  cloneWebApplicationTarget = {id: 'cloned-id'},
  deleteWebApplicationTarget = undefined,
  exportWebApplicationTarget = new Response('some-data'),
  createCredential = testing.fn().mockResolvedValue({data: {id: 'cred-id'}}),
}: CreateGmpParams = {}): {
  credentials: {getAll: ReturnType<typeof testing.fn>};
  webapplicationtarget: Record<string, ReturnType<typeof testing.fn>>;
  credential: {create: ReturnType<typeof testing.fn>};
  user: {currentSettings: ReturnType<typeof testing.fn>};
  session: ReturnType<typeof createSession>;
} => {
  const make = (val: unknown) =>
    typeof val === 'function'
      ? (val as unknown as MockFn)
      : testing.fn().mockResolvedValue(val);

  return {
    credentials: {
      getAll: testing.fn().mockResolvedValue(new Response(getAllCredentials)),
    },
    webapplicationtarget: {
      create: make(createWebApplicationTarget),
      save: make(saveWebApplicationTarget),
      clone: make(cloneWebApplicationTarget),
      delete: make(deleteWebApplicationTarget),
      export: make(exportWebApplicationTarget),
    },
    credential: {
      create: make(createCredential),
    },
    user: {
      currentSettings: testing
        .fn()
        .mockResolvedValue(currentSettingsDefaultResponse),
    },
    session: createSession(),
  };
};

describe('WebApplicationTargetsComponent tests', () => {
  test('should render', async () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp});

    render(
      <WebApplicationTargetsComponent>
        {() => <Button data-testid="button" />}
      </WebApplicationTargetsComponent>,
    );

    expect(screen.getByTestId('button')).toBeInTheDocument();
  });

  test('should open and close edit dialog (create)', async () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp, capabilities: true});

    render(
      <WebApplicationTargetsComponent>
        {({create}) => <Button data-testid="open" onClick={() => create()} />}
      </WebApplicationTargetsComponent>,
    );

    fireEvent.click(screen.getByTestId('open'));
    expect(
      await screen.findByText('New Web Application Target'),
    ).toBeInTheDocument();

    const cancelButton = screen.getDialogCloseButton();
    fireEvent.click(cancelButton);
    expect(
      screen.queryByText('New Web Application Target'),
    ).not.toBeInTheDocument();
  });

  test('should allow creating a new web application target', async () => {
    const gmp = createGmp();
    const onCreated = testing.fn();
    const onCreateError = testing.fn();
    const {render} = rendererWith({gmp, capabilities: true});

    render(
      <WebApplicationTargetsComponent
        onCreateError={onCreateError}
        onCreated={onCreated}
      >
        {({create}) => <Button data-testid="open" onClick={() => create()} />}
      </WebApplicationTargetsComponent>,
    );

    fireEvent.click(screen.getByTestId('open'));
    expect(
      await screen.findByText('New Web Application Target'),
    ).toBeInTheDocument();

    const saveButton = screen.getDialogSaveButton();
    fireEvent.click(saveButton);
    await wait();

    expect(
      screen.queryByText('New Web Application Target'),
    ).not.toBeInTheDocument();
    expect(onCreateError).not.toHaveBeenCalled();
    expect(onCreated).toHaveBeenCalledWith({id: 'created-id'});
  });

  test('should call onCreateError if creating fails and show error', async () => {
    const error = new Error('create error');
    const gmp = createGmp({
      createWebApplicationTarget: testing.fn().mockRejectedValue(error),
    });

    const onCreated = testing.fn();
    const onCreateError = testing.fn();
    const {render} = rendererWith({gmp, capabilities: true});

    render(
      <WebApplicationTargetsComponent
        onCreateError={onCreateError}
        onCreated={onCreated}
      >
        {({create}) => <Button data-testid="open" onClick={() => create()} />}
      </WebApplicationTargetsComponent>,
    );

    fireEvent.click(screen.getByTestId('open'));
    expect(
      await screen.findByText('New Web Application Target'),
    ).toBeInTheDocument();

    const saveButton = screen.getDialogSaveButton();
    fireEvent.click(saveButton);

    expect(screen.getByText('New Web Application Target')).toBeInTheDocument();
    expect(await screen.findByText('create error')).toBeInTheDocument();
    expect(onCreated).not.toHaveBeenCalled();
    expect(onCreateError).toHaveBeenCalled();
    assertHandlerError(onCreateError, error);
  });

  test('should allow editing existing target and save', async () => {
    const gmp = createGmp();
    const onSaved = testing.fn();
    const onSaveError = testing.fn();
    const {render} = rendererWith({gmp, capabilities: true});

    const target = makeTarget('123', 'foo');

    render(
      <WebApplicationTargetsComponent
        onSaveError={onSaveError}
        onSaved={onSaved}
      >
        {({edit}) => <Button data-testid="open" onClick={() => edit(target)} />}
      </WebApplicationTargetsComponent>,
    );

    fireEvent.click(screen.getByTestId('open'));
    expect(
      await screen.findByText('Edit Web Application Target - foo'),
    ).toBeInTheDocument();

    const saveButton = screen.getDialogSaveButton();
    fireEvent.click(saveButton);
    await wait();

    expect(
      screen.queryByText('Edit Web Application Target - foo'),
    ).not.toBeInTheDocument();
    expect(onSaveError).not.toHaveBeenCalled();
    expect(onSaved).toHaveBeenCalled();
  });

  test('should allow cloning a target', async () => {
    const gmp = createGmp();
    const onCloned = testing.fn();
    const onCloneError = testing.fn();
    const {render} = rendererWith({gmp, capabilities: true});

    const target = makeTarget('123', 'foo');

    render(
      <WebApplicationTargetsComponent
        onCloneError={onCloneError}
        onCloned={onCloned}
      >
        {({clone}) => (
          <Button data-testid="clone" onClick={() => clone(target)} />
        )}
      </WebApplicationTargetsComponent>,
    );

    fireEvent.click(screen.getByTestId('clone'));
    await wait();

    expect(onCloneError).not.toHaveBeenCalled();
    expect(onCloned).toHaveBeenCalledWith({id: 'cloned-id'});
  });

  test('should allow deleting a target', async () => {
    const gmp = createGmp();
    const onDeleted = testing.fn();
    const onDeleteError = testing.fn();
    const {render} = rendererWith({gmp, capabilities: true});

    const target = makeTarget('123', 'foo');

    render(
      <WebApplicationTargetsComponent
        onDeleteError={onDeleteError}
        onDeleted={onDeleted}
      >
        {({delete: del}) => (
          <Button data-testid="delete" onClick={() => del(target)} />
        )}
      </WebApplicationTargetsComponent>,
    );

    fireEvent.click(screen.getByTestId('delete'));
    await wait();

    expect(onDeleteError).not.toHaveBeenCalled();
    expect(onDeleted).toHaveBeenCalled();
  });
});

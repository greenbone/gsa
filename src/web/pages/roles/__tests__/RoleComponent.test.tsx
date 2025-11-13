/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {screen, rendererWith, wait, fireEvent} from 'web/testing';
import Role from 'gmp/models/role';
import Button from 'web/components/form/Button';
import {currentSettingsDefaultResponse} from 'web/pages/__mocks__/current-settings';
import RoleComponent from 'web/pages/roles/RoleComponent';

const defaultGetRoleResponse = {
  data: Role.fromElement({_id: '123', name: 'foo'}),
};
const currentSettings = testing
  .fn()
  .mockResolvedValue(currentSettingsDefaultResponse);
const createGmp = ({
  getRoleResponse = defaultGetRoleResponse,
  createRoleResponse = {id: '123'},
  saveRoleResponse = {id: '123'},
  cloneRoleResponse = {id: '123'},
  exportRoleResponse = {data: 'some data'},
  createRole = testing.fn().mockResolvedValue(createRoleResponse),
  getRole = testing.fn().mockResolvedValue(getRoleResponse),
  saveRole = testing.fn().mockResolvedValue(saveRoleResponse),
  cloneRole = testing.fn().mockResolvedValue(cloneRoleResponse),
  deleteRole = testing.fn().mockResolvedValue(undefined),
  exportRole = testing.fn().mockResolvedValue(exportRoleResponse),
} = {}) => {
  return {
    role: {
      get: getRole,
      create: createRole,
      save: saveRole,
      clone: cloneRole,
      delete: deleteRole,
      export: exportRole,
    },
    users: {
      get: testing.fn().mockResolvedValue({
        data: [],
        meta: {filter: {}, counts: {}},
      }),
    },
    groups: {
      get: testing.fn().mockResolvedValue({
        data: [],
        meta: {filter: {}, counts: {}},
      }),
    },
    user: {currentSettings},
  };
};

describe('RoleComponent tests', () => {
  test('should render without crashing', async () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp, capabilities: true, store: true});

    await wait();

    render(<RoleComponent>{() => <div>Some Content</div>}</RoleComponent>);
    expect(screen.getByText('Some Content')).toBeInTheDocument();
  });

  test('should open and close RoleDialog', async () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp, capabilities: true, store: true});
    render(
      <RoleComponent>
        {({create}) => <Button data-testid="open" onClick={() => create()} />}
      </RoleComponent>,
    );

    await wait();

    fireEvent.click(screen.getByTestId('open'));
    expect(screen.getByText('New Role')).toBeInTheDocument();

    const cancelButton = screen.getDialogCloseButton();
    fireEvent.click(cancelButton);
    expect(screen.queryByText('New Role')).not.toBeInTheDocument();
  });

  test('should allow creating a new role', async () => {
    const gmp = createGmp();
    const onCreated = testing.fn();
    const onCreateError = testing.fn();
    const {render} = rendererWith({gmp, capabilities: true, store: true});
    render(
      <RoleComponent onCreateError={onCreateError} onCreated={onCreated}>
        {({create}) => <Button data-testid="open" onClick={() => create()} />}
      </RoleComponent>,
    );

    fireEvent.click(screen.getByTestId('open'));
    expect(screen.getByText('New Role')).toBeInTheDocument();

    const saveButton = screen.getDialogSaveButton();
    fireEvent.click(saveButton);
    await wait();

    expect(screen.queryByText('New Role')).not.toBeInTheDocument();
    expect(onCreateError).not.toHaveBeenCalled();
    expect(onCreated).toHaveBeenCalledWith({id: '123'});
  });

  test('should call onCreateError if creating a new role fails', async () => {
    const error = new Error('error');
    const gmp = createGmp({
      createRole: testing.fn().mockRejectedValue(error),
    });

    const onCreated = testing.fn();
    const onCreateError = testing.fn();
    const {render} = rendererWith({gmp, capabilities: true, store: true});
    render(
      <RoleComponent onCreateError={onCreateError} onCreated={onCreated}>
        {({create}) => <Button data-testid="open" onClick={() => create()} />}
      </RoleComponent>,
    );

    fireEvent.click(screen.getByTestId('open'));
    await wait();
    expect(screen.getByText('New Role')).toBeInTheDocument();

    const saveButton = screen.getDialogSaveButton();
    fireEvent.click(saveButton);
    await wait();
    expect(screen.queryByText('New Role')).not.toBeInTheDocument();
    expect(onCreated).not.toHaveBeenCalled();
    expect(onCreateError).toHaveBeenCalledWith(error);
  });

  test('should show error in dialog if creating a new role fails', async () => {
    const error = new Error('some error');
    const gmp = createGmp({
      createRole: testing.fn().mockRejectedValue(error),
    });

    const onCreated = testing.fn();
    const {render} = rendererWith({gmp, capabilities: true, store: true});
    render(
      <RoleComponent onCreated={onCreated}>
        {({create}) => <Button data-testid="open" onClick={() => create()} />}
      </RoleComponent>,
    );

    fireEvent.click(screen.getByTestId('open'));
    await wait();
    expect(screen.getByText('New Role')).toBeInTheDocument();

    const saveButton = screen.getDialogSaveButton();
    fireEvent.click(saveButton);
    await wait();
    screen.getByText('New Role');
    screen.getByText('some error');
    expect(onCreated).not.toHaveBeenCalled();
  });

  test('should allow editing a role', async () => {
    const gmp = createGmp();
    const onSaved = testing.fn();
    const onSaveError = testing.fn();
    const {render} = rendererWith({gmp, capabilities: true, store: true});
    render(
      <RoleComponent onSaveError={onSaveError} onSaved={onSaved}>
        {({edit}) => (
          <Button
            data-testid="open"
            onClick={() => edit(Role.fromElement({_id: '123', name: 'foo'}))}
          />
        )}
      </RoleComponent>,
    );

    fireEvent.click(screen.getByTestId('open'));
    await wait();
    expect(screen.getByText('Edit Role foo')).toBeInTheDocument();

    const saveButton = screen.getDialogSaveButton();
    fireEvent.click(saveButton);
    await wait();
    expect(screen.queryByText('Edit Role foo')).not.toBeInTheDocument();
    expect(onSaveError).not.toHaveBeenCalled();
    expect(onSaved).toHaveBeenCalledWith({id: '123'});
  });

  test('should call onSaveError if saving a role fails', async () => {
    const error = new Error('error');
    const gmp = createGmp({
      saveRole: testing.fn().mockRejectedValue(error),
    });

    const onSaved = testing.fn();
    const onSaveError = testing.fn();
    const {render} = rendererWith({gmp, capabilities: true, store: true});
    render(
      <RoleComponent onSaveError={onSaveError} onSaved={onSaved}>
        {({edit}) => (
          <Button
            data-testid="open"
            onClick={() => edit(Role.fromElement({_id: '123', name: 'foo'}))}
          />
        )}
      </RoleComponent>,
    );

    fireEvent.click(screen.getByTestId('open'));
    await wait();
    expect(screen.getByText('Edit Role foo')).toBeInTheDocument();

    const saveButton = screen.getDialogSaveButton();
    fireEvent.click(saveButton);
    await wait();

    expect(screen.queryByText('Edit Role foo')).not.toBeInTheDocument();
    expect(onSaveError).toHaveBeenCalledExactlyOnceWith(error);
    expect(onSaved).not.toHaveBeenCalled();
  });

  test('should show error in dialog if saving a role fails', async () => {
    const error = new Error('some error');
    const gmp = createGmp({
      saveRole: testing.fn().mockRejectedValue(error),
    });

    const onSaved = testing.fn();
    const {render} = rendererWith({gmp, capabilities: true, store: true});
    render(
      <RoleComponent onSaved={onSaved}>
        {({edit}) => (
          <Button
            data-testid="open"
            onClick={() => edit(Role.fromElement({_id: '123', name: 'foo'}))}
          />
        )}
      </RoleComponent>,
    );

    fireEvent.click(screen.getByTestId('open'));
    await wait();
    screen.getByText('Edit Role foo');

    const saveButton = screen.getDialogSaveButton();
    fireEvent.click(saveButton);
    await wait();

    screen.getByText('Edit Role foo');
    screen.getByText('some error');
    expect(onSaved).not.toHaveBeenCalled();
  });

  test('should allow cloning a role', async () => {
    const gmp = createGmp();
    const onCloned = testing.fn();
    const onCloneError = testing.fn();

    const {render} = rendererWith({gmp, capabilities: true, store: true});
    render(
      <RoleComponent onCloneError={onCloneError} onCloned={onCloned}>
        {({clone}) => (
          <Button
            data-testid="button"
            onClick={() => clone(new Role({id: '123'}))}
          />
        )}
      </RoleComponent>,
    );

    fireEvent.click(screen.getByTestId('button'));
    await wait();
    expect(onCloneError).not.toHaveBeenCalled();
    expect(onCloned).toHaveBeenCalledExactlyOnceWith({id: '123'});
  });

  test('should call onCloneError when cloning a role fails', async () => {
    const error = new Error('error');
    const onCloned = testing.fn();
    const onCloneError = testing.fn();

    const gmp = createGmp({
      cloneRole: testing.fn().mockRejectedValue(error),
    });
    const {render} = rendererWith({gmp, capabilities: true, store: true});
    render(
      <RoleComponent onCloneError={onCloneError} onCloned={onCloned}>
        {({clone}) => (
          <Button
            data-testid="button"
            onClick={() => clone(new Role({id: '123'}))}
          />
        )}
      </RoleComponent>,
    );

    fireEvent.click(screen.getByTestId('button'));
    await wait();
    expect(onCloned).not.toHaveBeenCalled();
    expect(onCloneError).toHaveBeenCalledExactlyOnceWith(error);
  });

  test('should allow deleting a role', async () => {
    const onDeleted = testing.fn();
    const onDeleteError = testing.fn();
    const gmp = createGmp();
    const {render} = rendererWith({gmp, capabilities: true});
    render(
      <RoleComponent onDeleteError={onDeleteError} onDeleted={onDeleted}>
        {({delete: del}) => (
          <Button
            data-testid="button"
            onClick={() => del(new Role({id: '123'}))}
          />
        )}
      </RoleComponent>,
    );

    fireEvent.click(screen.getByTestId('button'));
    await wait();
    expect(onDeleteError).not.toHaveBeenCalled();
    expect(onDeleted).toHaveBeenCalledOnce();
  });

  test('should call onDeleteError when deleting a role fails', async () => {
    const error = new Error('error');
    const onDeleted = testing.fn();
    const onDeleteError = testing.fn();

    const gmp = createGmp({
      deleteRole: testing.fn().mockRejectedValue(error),
    });
    const {render} = rendererWith({gmp, capabilities: true});
    render(
      <RoleComponent onDeleteError={onDeleteError} onDeleted={onDeleted}>
        {({delete: del}) => (
          <Button
            data-testid="button"
            onClick={() => del(new Role({id: '123'}))}
          />
        )}
      </RoleComponent>,
    );

    fireEvent.click(screen.getByTestId('button'));
    await wait();
    expect(onDeleted).not.toHaveBeenCalled();
    expect(onDeleteError).toHaveBeenCalledExactlyOnceWith(error);
  });

  test('should allow downloading a role', async () => {
    const onDownloaded = testing.fn();
    const onDownloadError = testing.fn();

    const gmp = createGmp();
    const {render} = rendererWith({gmp, capabilities: true});
    render(
      <RoleComponent
        onDownloadError={onDownloadError}
        onDownloaded={onDownloaded}
      >
        {({download}) => (
          <Button
            data-testid="button"
            onClick={() => download(new Role({id: '123'}))}
          />
        )}
      </RoleComponent>,
    );

    fireEvent.click(screen.getByTestId('button'));
    await wait();
    expect(onDownloadError).not.toHaveBeenCalled();
    expect(onDownloaded).toHaveBeenCalledOnce();
  });

  test('should call onDownloadError when downloading a role fails', async () => {
    const error = new Error('error');
    const onDownloaded = testing.fn();
    const onDownloadError = testing.fn();
    const gmp = createGmp({
      exportRole: testing.fn().mockRejectedValue(error),
    });
    const {render} = rendererWith({gmp, capabilities: true});
    render(
      <RoleComponent
        onDownloadError={onDownloadError}
        onDownloaded={onDownloaded}
      >
        {({download}) => (
          <Button
            data-testid="button"
            onClick={() => download(new Role({id: '123'}))}
          />
        )}
      </RoleComponent>,
    );

    fireEvent.click(screen.getByTestId('button'));
    await wait();
    expect(onDownloaded).not.toHaveBeenCalled();
    expect(onDownloadError).toHaveBeenCalledExactlyOnceWith(error);
  });
});

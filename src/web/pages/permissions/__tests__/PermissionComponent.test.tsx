/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {screen, rendererWith, wait, fireEvent} from 'web/testing';
import Permission from 'gmp/models/permission';
import Button from 'web/components/form/Button';
import {currentSettingsDefaultResponse} from 'web/pages/__mocks__/CurrentSettings';
import PermissionComponent from 'web/pages/permissions/PermissionComponent';

const getPermissionResponse = {
  data: Permission.fromElement({_id: '123', name: 'get_tasks'}),
};
const currentSettings = testing
  .fn()
  .mockResolvedValue(currentSettingsDefaultResponse);
const getPermission = testing.fn().mockResolvedValue(getPermissionResponse);

describe('PermissionComponent tests', () => {
  test('should render without crashing', () => {
    const gmp = {
      permission: {
        get: getPermission,
      },
      user: {currentSettings},
    };

    const {render} = rendererWith({gmp, capabilities: true, store: true});
    render(
      <PermissionComponent>
        {() => <div>Some Content</div>}
      </PermissionComponent>,
    );
    expect(screen.getByText('Some Content')).toBeInTheDocument();
  });

  test('should open and close PermissionDialog', async () => {
    const gmp = {
      permission: {
        get: getPermission,
      },
      users: {
        getAll: testing.fn().mockResolvedValue({
          data: [],
        }),
      },
      roles: {
        getAll: testing.fn().mockResolvedValue({
          data: [],
        }),
      },
      groups: {
        getAll: testing.fn().mockResolvedValue({
          data: [],
        }),
      },
      user: {currentSettings},
    };

    const {render} = rendererWith({gmp, capabilities: true, store: true});
    render(
      <PermissionComponent>
        {({create}) => <Button data-testid="open" onClick={() => create()} />}
      </PermissionComponent>,
    );

    fireEvent.click(screen.getByTestId('open'));
    await wait();
    expect(screen.getByText('New Permission')).toBeInTheDocument();

    const cancelButton = screen.getDialogCloseButton();
    fireEvent.click(cancelButton);
    expect(screen.queryByText('New Permission')).not.toBeInTheDocument();
  });

  test('should allow creating a new permission', async () => {
    const newPermission = Permission.fromElement({_id: '123'});
    const gmp = {
      permission: {
        create: testing.fn().mockResolvedValue(newPermission),
      },
      users: {
        getAll: testing.fn().mockResolvedValue({
          data: [],
        }),
      },
      roles: {
        getAll: testing.fn().mockResolvedValue({
          data: [],
        }),
      },
      groups: {
        getAll: testing.fn().mockResolvedValue({
          data: [],
        }),
      },
      user: {currentSettings},
    };

    const onCreated = testing.fn();
    const onCreateError = testing.fn();
    const {render} = rendererWith({gmp, capabilities: true, store: true});
    render(
      <PermissionComponent onCreateError={onCreateError} onCreated={onCreated}>
        {({create}) => <Button data-testid="open" onClick={() => create()} />}
      </PermissionComponent>,
    );

    fireEvent.click(screen.getByTestId('open'));
    await wait();
    expect(screen.getByText('New Permission')).toBeInTheDocument();

    const saveButton = screen.getDialogSaveButton();
    fireEvent.click(saveButton);
    await wait();

    expect(screen.queryByText('New Permission')).not.toBeInTheDocument();
    expect(onCreated).toHaveBeenCalledWith(newPermission);
    expect(onCreateError).not.toHaveBeenCalled();
  });

  test('should call onCreateError if creating a new permission fails', async () => {
    const error = new Error('error');
    const gmp = {
      permission: {
        create: testing.fn().mockRejectedValue(error),
      },
      users: {
        getAll: testing.fn().mockResolvedValue({
          data: [],
        }),
      },
      roles: {
        getAll: testing.fn().mockResolvedValue({
          data: [],
        }),
      },
      groups: {
        getAll: testing.fn().mockResolvedValue({
          data: [],
        }),
      },
      user: {currentSettings},
    };

    const onCreated = testing.fn();
    const onCreateError = testing.fn();
    const {render} = rendererWith({gmp, capabilities: true, store: true});
    render(
      <PermissionComponent onCreateError={onCreateError} onCreated={onCreated}>
        {({create}) => <Button data-testid="open" onClick={() => create()} />}
      </PermissionComponent>,
    );

    fireEvent.click(screen.getByTestId('open'));
    await wait();
    expect(screen.getByText('New Permission')).toBeInTheDocument();

    const saveButton = screen.getDialogSaveButton();
    fireEvent.click(saveButton);
    await wait();
    expect(screen.queryByText('New Permission')).not.toBeInTheDocument();
    expect(onCreated).not.toHaveBeenCalled();
    expect(onCreateError).toHaveBeenCalledWith(error);
  });

  test('should show error in dialog if creating a new permission fails', async () => {
    const error = new Error('some error');
    const gmp = {
      permission: {
        create: testing.fn().mockRejectedValue(error),
      },
      users: {
        getAll: testing.fn().mockResolvedValue({
          data: [],
        }),
      },
      roles: {
        getAll: testing.fn().mockResolvedValue({
          data: [],
        }),
      },
      groups: {
        getAll: testing.fn().mockResolvedValue({
          data: [],
        }),
      },
      user: {currentSettings},
    };

    const onCreated = testing.fn();
    const {render} = rendererWith({gmp, capabilities: true, store: true});
    render(
      <PermissionComponent onCreated={onCreated}>
        {({create}) => <Button data-testid="open" onClick={() => create()} />}
      </PermissionComponent>,
    );

    fireEvent.click(screen.getByTestId('open'));
    await wait();
    expect(screen.getByText('New Permission')).toBeInTheDocument();

    const saveButton = screen.getDialogSaveButton();
    fireEvent.click(saveButton);
    await wait();
    screen.getByText('New Permission');
    screen.getByText('some error');
    expect(onCreated).not.toHaveBeenCalled();
  });

  test('should allow editing a permission', async () => {
    const permission = Permission.fromElement({_id: '123', name: 'get_tasks'});
    const permissionResponse = {data: permission};
    const gmp = {
      permission: {
        get: testing.fn().mockResolvedValue(permissionResponse),
        save: testing.fn().mockResolvedValue(permission),
      },
      users: {
        getAll: testing.fn().mockResolvedValue({
          data: [],
        }),
      },
      roles: {
        getAll: testing.fn().mockResolvedValue({
          data: [],
        }),
      },
      groups: {
        getAll: testing.fn().mockResolvedValue({
          data: [],
        }),
      },
      user: {currentSettings},
    };

    const onSaved = testing.fn();
    const onSaveError = testing.fn();
    const {render} = rendererWith({gmp, capabilities: true, store: true});
    render(
      <PermissionComponent onSaveError={onSaveError} onSaved={onSaved}>
        {({edit}) => (
          <Button
            data-testid="open"
            onClick={() => edit(new Permission({id: '123'}))}
          />
        )}
      </PermissionComponent>,
    );

    fireEvent.click(screen.getByTestId('open'));
    await wait();
    expect(screen.getByTestId('dialog-save-button')).toBeInTheDocument();

    const saveButton = screen.getDialogSaveButton();
    fireEvent.click(saveButton);
    await wait();
    expect(screen.queryByTestId('dialog-save-button')).not.toBeInTheDocument();
    expect(onSaved).toHaveBeenCalledWith(permission);
    expect(onSaveError).not.toHaveBeenCalled();
  });

  test('should call onSaveError if saving a permission fails', async () => {
    const permission = Permission.fromElement({_id: '123', name: 'get_tasks'});
    const permissionResponse = {data: permission};
    const error = new Error('error');
    const gmp = {
      permission: {
        get: testing.fn().mockResolvedValue(permissionResponse),
        save: testing.fn().mockRejectedValue(error),
      },
      users: {
        getAll: testing.fn().mockResolvedValue({
          data: [],
        }),
      },
      roles: {
        getAll: testing.fn().mockResolvedValue({
          data: [],
        }),
      },
      groups: {
        getAll: testing.fn().mockResolvedValue({
          data: [],
        }),
      },
      user: {currentSettings},
    };

    const onSaved = testing.fn();
    const onSaveError = testing.fn();
    const {render} = rendererWith({gmp, capabilities: true, store: true});
    render(
      <PermissionComponent onSaveError={onSaveError} onSaved={onSaved}>
        {({edit}) => (
          <Button
            data-testid="open"
            onClick={() => edit(new Permission({id: '123'}))}
          />
        )}
      </PermissionComponent>,
    );

    fireEvent.click(screen.getByTestId('open'));
    await wait();
    expect(screen.getByTestId('dialog-save-button')).toBeInTheDocument();

    const saveButton = screen.getDialogSaveButton();
    fireEvent.click(saveButton);
    await wait();

    expect(screen.queryByTestId('dialog-save-button')).not.toBeInTheDocument();
    expect(onSaved).not.toHaveBeenCalled();
    expect(onSaveError).toHaveBeenCalledExactlyOnceWith(error);
  });

  test('should show error in dialog if saving a permission fails', async () => {
    const permission = Permission.fromElement({_id: '123', name: 'get_tasks'});
    const permissionResponse = {data: permission};
    const error = new Error('some error');
    const gmp = {
      permission: {
        get: testing.fn().mockResolvedValue(permissionResponse),
        save: testing.fn().mockRejectedValue(error),
      },
      users: {
        getAll: testing.fn().mockResolvedValue({
          data: [],
        }),
      },
      roles: {
        getAll: testing.fn().mockResolvedValue({
          data: [],
        }),
      },
      groups: {
        getAll: testing.fn().mockResolvedValue({
          data: [],
        }),
      },
      user: {currentSettings},
    };

    const onSaved = testing.fn();
    const {render} = rendererWith({gmp, capabilities: true, store: true});
    render(
      <PermissionComponent onSaved={onSaved}>
        {({edit}) => (
          <Button
            data-testid="open"
            onClick={() => edit(new Permission({id: '123'}))}
          />
        )}
      </PermissionComponent>,
    );

    fireEvent.click(screen.getByTestId('open'));
    await wait();
    expect(screen.getByTestId('dialog-save-button')).toBeInTheDocument();

    const saveButton = screen.getDialogSaveButton();
    fireEvent.click(saveButton);
    await wait();

    expect(screen.getByTestId('dialog-save-button')).toBeInTheDocument(); // Dialog should still be visible due to error
    screen.getByText('some error');
    expect(onSaved).not.toHaveBeenCalled();
  });

  test('should allow cloning a permission', async () => {
    const cloned = Permission.fromElement({_id: '123'});
    const gmp = {
      permission: {
        clone: testing.fn().mockResolvedValue(cloned),
      },
      user: {currentSettings},
    };
    const onCloned = testing.fn();
    const onCloneError = testing.fn();

    const {render} = rendererWith({gmp, capabilities: true, store: true});
    render(
      <PermissionComponent onCloneError={onCloneError} onCloned={onCloned}>
        {({clone}) => (
          <Button
            data-testid="button"
            onClick={() => clone(new Permission({id: '123'}))}
          />
        )}
      </PermissionComponent>,
    );

    fireEvent.click(screen.getByTestId('button'));
    await wait();
    expect(onCloned).toHaveBeenCalledExactlyOnceWith(cloned);
    expect(onCloneError).not.toHaveBeenCalled();
  });

  test('should call onCloneError when cloning a permission fails', async () => {
    const error = new Error('error');
    const onCloned = testing.fn();
    const onCloneError = testing.fn();

    const gmp = {
      permission: {
        clone: testing.fn().mockRejectedValue(error),
      },
      user: {currentSettings},
    };
    const {render} = rendererWith({gmp, capabilities: true, store: true});
    render(
      <PermissionComponent onCloneError={onCloneError} onCloned={onCloned}>
        {({clone}) => (
          <Button
            data-testid="button"
            onClick={() => clone(new Permission({id: '123'}))}
          />
        )}
      </PermissionComponent>,
    );

    fireEvent.click(screen.getByTestId('button'));
    await wait();
    expect(onCloneError).toHaveBeenCalledExactlyOnceWith(error);
    expect(onCloned).not.toHaveBeenCalled();
  });

  test('should allow deleting a permission', async () => {
    const deleted = {id: '123'};
    const onDeleted = testing.fn();
    const onDeleteError = testing.fn();

    const gmp = {
      permission: {
        delete: testing.fn().mockResolvedValue(deleted),
      },
      user: {currentSettings},
    };
    const {render} = rendererWith({gmp, capabilities: true});
    render(
      <PermissionComponent onDeleteError={onDeleteError} onDeleted={onDeleted}>
        {({delete: del}) => (
          <Button
            data-testid="button"
            onClick={() => del(new Permission({id: '123'}))}
          />
        )}
      </PermissionComponent>,
    );

    fireEvent.click(screen.getByTestId('button'));
    await wait();
    expect(onDeleted).toHaveBeenCalledOnce();
    expect(onDeleteError).not.toHaveBeenCalled();
  });

  test('should call onDeleteError when deleting a permission fails', async () => {
    const error = new Error('error');
    const onDeleted = testing.fn();
    const onDeleteError = testing.fn();

    const gmp = {
      permission: {delete: testing.fn().mockRejectedValue(error)},
      user: {currentSettings},
    };
    const {render} = rendererWith({gmp, capabilities: true});
    render(
      <PermissionComponent onDeleteError={onDeleteError} onDeleted={onDeleted}>
        {({delete: del}) => (
          <Button
            data-testid="button"
            onClick={() => del(new Permission({id: '123'}))}
          />
        )}
      </PermissionComponent>,
    );

    fireEvent.click(screen.getByTestId('button'));
    await wait();
    expect(onDeleteError).toHaveBeenCalledExactlyOnceWith(error);
    expect(onDeleted).not.toHaveBeenCalled();
  });

  test('should allow downloading a permission', async () => {
    const exported = {data: 'xml data'};
    const onDownloaded = testing.fn();
    const onDownloadError = testing.fn();

    const gmp = {
      permission: {
        export: testing.fn().mockResolvedValue(exported),
      },
      user: {currentSettings},
    };
    const {render} = rendererWith({gmp, capabilities: true});
    render(
      <PermissionComponent
        onDownloadError={onDownloadError}
        onDownloaded={onDownloaded}
      >
        {({download}) => (
          <Button
            data-testid="button"
            onClick={() => download(new Permission({id: '123'}))}
          />
        )}
      </PermissionComponent>,
    );

    fireEvent.click(screen.getByTestId('button'));
    await wait();
    expect(onDownloaded).toHaveBeenCalledOnce();
    expect(onDownloadError).not.toHaveBeenCalled();
  });

  test('should call onDownloadError when downloading a permission fails', async () => {
    const error = new Error('error');
    const onDownloaded = testing.fn();
    const onDownloadError = testing.fn();

    const gmp = {
      permission: {export: testing.fn().mockRejectedValue(error)},
      user: {currentSettings},
    };
    const {render} = rendererWith({gmp, capabilities: true});
    render(
      <PermissionComponent
        onDownloadError={onDownloadError}
        onDownloaded={onDownloaded}
      >
        {({download}) => (
          <Button
            data-testid="button"
            onClick={() => download(new Permission({id: '123'}))}
          />
        )}
      </PermissionComponent>,
    );

    fireEvent.click(screen.getByTestId('button'));
    await wait();
    expect(onDownloadError).toHaveBeenCalledExactlyOnceWith(error);
    expect(onDownloaded).not.toHaveBeenCalled();
  });

  test('should open permission dialog with permission subject information', async () => {
    const permission = Permission.fromElement({
      _id: '123',
      name: 'get_tasks',
      comment: 'Test comment',
      subject: {
        _id: 'user-123',
        type: 'user',
      },
      resource: {
        _id: 'resource-123',
        type: 'task',
      },
    });

    const gmp = {
      permission: {
        get: testing.fn().mockResolvedValue({data: permission}),
        save: testing.fn().mockResolvedValue(permission),
      },
      users: {
        getAll: testing.fn().mockResolvedValue({
          data: [{id: 'user-123', name: 'testuser'}],
        }),
      },
      roles: {
        getAll: testing.fn().mockResolvedValue({
          data: [],
        }),
      },
      groups: {
        getAll: testing.fn().mockResolvedValue({
          data: [],
        }),
      },
      user: {currentSettings},
    };

    const {render} = rendererWith({gmp, capabilities: true, store: true});
    render(
      <PermissionComponent>
        {({edit}) => (
          <Button data-testid="open" onClick={() => edit(permission)} />
        )}
      </PermissionComponent>,
    );

    fireEvent.click(screen.getByTestId('open'));
    await wait();
    // Check that the dialog is open by looking for dialog elements
    expect(screen.getByTestId('dialog-save-button')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test comment')).toBeInTheDocument();
  });
});

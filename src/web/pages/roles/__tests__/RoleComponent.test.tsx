/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {screen, rendererWith, wait, fireEvent} from 'web/testing';
import Role from 'gmp/models/role';
import Button from 'web/components/form/Button';
import {currentSettingsDefaultResponse} from 'web/pages/__mocks__/CurrentSettings';
import RoleComponent from 'web/pages/roles/RoleComponent';

const getRoleResponse = {
  data: Role.fromElement({_id: '123', name: 'foo'}),
};
const currentSettings = testing
  .fn()
  .mockResolvedValue(currentSettingsDefaultResponse);
const getRole = testing.fn().mockResolvedValue(getRoleResponse);

describe('RoleComponent tests', () => {
  test('should render without crashing', () => {
    const gmp = {
      role: {
        get: getRole,
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

    const {render} = rendererWith({gmp, capabilities: true, store: true});
    render(<RoleComponent>{() => <div>Some Content</div>}</RoleComponent>);
    expect(screen.getByText('Some Content')).toBeInTheDocument();
  });

  test('should open and close RoleDialog', () => {
    const gmp = {
      role: {
        get: getRole,
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

    const {render} = rendererWith({gmp, capabilities: true, store: true});
    render(
      <RoleComponent>
        {({create}) => <Button data-testid="open" onClick={() => create()} />}
      </RoleComponent>,
    );

    fireEvent.click(screen.getByTestId('open'));
    expect(screen.getByText('New Role')).toBeInTheDocument();

    const cancelButton = screen.getDialogCloseButton();
    fireEvent.click(cancelButton);
    expect(screen.queryByText('New Role')).not.toBeInTheDocument();
  });

  test('should allow creating a new role', async () => {
    const newRole = Role.fromElement({_id: '123'});
    const gmp = {
      role: {
        create: testing.fn().mockResolvedValue(newRole),
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
    expect(onCreated).toHaveBeenCalledWith(newRole);
    expect(onCreateError).not.toHaveBeenCalled();
  });

  test('should call onCreateError if creating a new role fails', async () => {
    const error = new Error('error');
    const gmp = {
      role: {
        create: testing.fn().mockRejectedValue(error),
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
    const gmp = {
      role: {
        create: testing.fn().mockRejectedValue(error),
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
    const role = Role.fromElement({_id: '123', name: 'foo'});
    const roleResponse = {data: role};
    const gmp = {
      role: {
        get: testing.fn().mockResolvedValue(roleResponse),
        save: testing.fn().mockResolvedValue(role),
      },
      capabilities: {
        mayAccess: testing.fn().mockReturnValue(true),
      },
      permissions: {
        getAll: testing.fn().mockResolvedValue({data: []}),
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
    expect(onSaved).toHaveBeenCalledWith(role);
    expect(onSaveError).not.toHaveBeenCalled();
  });

  test('should call onSaveError if saving a role fails', async () => {
    const role = Role.fromElement({_id: '123', name: 'foo'});
    const roleResponse = {data: role};
    const error = new Error('error');
    const gmp = {
      role: {
        get: testing.fn().mockResolvedValue(roleResponse),
        save: testing.fn().mockRejectedValue(error),
      },
      capabilities: {
        mayAccess: testing.fn().mockReturnValue(true),
      },
      permissions: {
        getAll: testing.fn().mockResolvedValue({data: []}),
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
    expect(onSaved).not.toHaveBeenCalled();
    expect(onSaveError).toHaveBeenCalledExactlyOnceWith(error);
  });

  test('should show error in dialog if saving a role fails', async () => {
    const role = Role.fromElement({_id: '123', name: 'foo'});
    const roleResponse = {data: role};
    const error = new Error('some error');
    const gmp = {
      role: {
        get: testing.fn().mockResolvedValue(roleResponse),
        save: testing.fn().mockRejectedValue(error),
      },
      capabilities: {
        mayAccess: testing.fn().mockReturnValue(true),
      },
      permissions: {
        getAll: testing.fn().mockResolvedValue({data: []}),
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
    const cloned = Role.fromElement({_id: '123'});
    const gmp = {
      role: {
        clone: testing.fn().mockResolvedValue(cloned),
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
    expect(onCloned).toHaveBeenCalledExactlyOnceWith(cloned);
    expect(onCloneError).not.toHaveBeenCalled();
  });

  test('should call onCloneError when cloning a role fails', async () => {
    const error = new Error('error');
    const onCloned = testing.fn();
    const onCloneError = testing.fn();

    const gmp = {
      role: {
        clone: testing.fn().mockRejectedValue(error),
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
    expect(onCloneError).toHaveBeenCalledExactlyOnceWith(error);
    expect(onCloned).not.toHaveBeenCalled();
  });

  test('should allow deleting a role', async () => {
    const deleted = {id: '123'};
    const onDeleted = testing.fn();
    const onDeleteError = testing.fn();

    const gmp = {
      role: {
        delete: testing.fn().mockResolvedValue(deleted),
      },
      user: {currentSettings},
    };
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
    expect(onDeleted).toHaveBeenCalledOnce();
    expect(onDeleteError).not.toHaveBeenCalled();
  });

  test('should call onDeleteError when deleting a role fails', async () => {
    const error = new Error('error');
    const onDeleted = testing.fn();
    const onDeleteError = testing.fn();

    const gmp = {
      role: {delete: testing.fn().mockRejectedValue(error)},
      user: {currentSettings},
    };
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
    expect(onDeleteError).toHaveBeenCalledExactlyOnceWith(error);
    expect(onDeleted).not.toHaveBeenCalled();
  });

  test('should allow downloading a role', async () => {
    const exported = {data: 'xml data'};
    const onDownloaded = testing.fn();
    const onDownloadError = testing.fn();

    const gmp = {
      role: {
        export: testing.fn().mockResolvedValue(exported),
      },
      user: {currentSettings},
    };
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
    expect(onDownloaded).toHaveBeenCalledOnce();
    expect(onDownloadError).not.toHaveBeenCalled();
  });

  test('should call onDownloadError when downloading a role fails', async () => {
    const error = new Error('error');
    const onDownloaded = testing.fn();
    const onDownloadError = testing.fn();

    const gmp = {
      role: {export: testing.fn().mockRejectedValue(error)},
      user: {currentSettings},
    };
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
    expect(onDownloadError).toHaveBeenCalledExactlyOnceWith(error);
    expect(onDownloaded).not.toHaveBeenCalled();
  });
});

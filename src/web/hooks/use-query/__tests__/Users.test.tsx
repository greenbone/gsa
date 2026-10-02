/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test, testing} from '@gsa/testing';
import {fireEvent, rendererWith, screen, waitFor} from 'web/testing';
import CollectionCounts from 'gmp/collection/collection-counts';
import QueryFilter from 'gmp/models/filter/query-filter';
import User from 'gmp/models/user';
import {createSession} from 'gmp/testing';
import {
  useBulkDeleteUsers,
  useBulkExportUsers,
  useCloneUser,
  useCreateUser,
  useDeleteUser,
  useDownloadUser,
  useGetUser,
  useGetUsers,
  useSaveUser,
} from 'web/hooks/use-query/users';

const userData = {
  accessHosts: ['localhost', '127.0.0.1'],
  authMethod: 'password',
  comment: 'comment',
  groupIds: ['group-id'],
  hostsAllow: '0',
  name: 'user',
  password: 'password',
  roleIds: ['role-id'],
};

const user = User.fromElement({_id: 'user-id', name: 'user'});
const userFilter = QueryFilter.fromString('name~user');

const createGmp = (
  userMethods: Record<string, unknown> = {},
  token = 'test-token',
) => ({
  session: createSession({token}),
  settings: {},
  user: {
    get: testing.fn().mockResolvedValue({data: user}),
    create: testing.fn().mockResolvedValue({data: {id: 'created'}}),
    save: testing.fn().mockResolvedValue({data: {id: 'saved'}}),
    clone: testing.fn().mockResolvedValue({data: {id: 'cloned'}}),
    delete: testing.fn().mockResolvedValue(undefined),
    export: testing.fn().mockResolvedValue({data: 'user-content'}),
    ...userMethods,
  },
  users: {
    get: testing.fn().mockResolvedValue({
      data: [user],
      meta: {
        filter: userFilter,
        counts: new CollectionCounts({all: 1, filtered: 1, length: 1}),
      },
    }),
    delete: testing.fn().mockResolvedValue({data: []}),
    export: testing.fn().mockResolvedValue({data: 'users-content'}),
    exportByFilter: testing.fn().mockResolvedValue({data: 'users-content'}),
  },
});

describe('user query hooks', () => {
  test('should fetch users with a filter', async () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp, router: true});

    const TestComponent = () => {
      const {data} = useGetUsers({filter: userFilter});
      return <div data-testid="user">{data?.entities[0]?.name}</div>;
    };

    render(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('user');
    });

    expect(gmp.users.get).toHaveBeenCalledWith({filter: userFilter});
  });

  test('should fetch a user by ID', async () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp, router: true});

    const TestComponent = () => {
      const {data} = useGetUser({id: 'user-id'});
      return <div data-testid="user">{data?.name}</div>;
    };

    render(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('user');
    });

    expect(gmp.user.get).toHaveBeenCalledWith({id: 'user-id'});
  });

  test('should not fetch users without a session token', () => {
    const gmp = createGmp({}, '');
    const {render} = rendererWith({gmp, router: true});

    const TestComponent = () => {
      useGetUsers({filter: userFilter});
      return <div />;
    };

    render(<TestComponent />);

    expect(gmp.users.get).not.toHaveBeenCalled();
  });

  test('should not fetch a user when the ID is empty', () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp, router: true});

    const TestComponent = () => {
      useGetUser({id: ''});
      return <div />;
    };

    render(<TestComponent />);

    expect(gmp.user.get).not.toHaveBeenCalled();
  });
});

describe('useCreateUser', () => {
  test('forwards access_hosts arrays when creating a user', async () => {
    const create = testing.fn().mockResolvedValue({data: {id: 'created'}});
    const gmp = createGmp({create});
    const {render} = rendererWith({gmp, router: true});

    const TestComponent = () => {
      const mutation = useCreateUser();
      return <button onClick={() => mutation.mutate(userData)}>Create</button>;
    };

    render(<TestComponent />);
    fireEvent.click(screen.getByRole('button', {name: 'Create'}));

    await waitFor(() => {
      expect(create).toHaveBeenCalledWith(userData);
    });
  });
  test('calls onSuccess with created user data', async () => {
    const create = testing.fn().mockResolvedValue({data: {id: 'created'}});
    const onSuccess = testing.fn();
    const gmp = createGmp({create});
    const {render} = rendererWith({gmp, router: true});

    const TestComponent = () => {
      const mutation = useCreateUser({onSuccess});
      return <button onClick={() => mutation.mutate(userData)}>Create</button>;
    };

    render(<TestComponent />);
    fireEvent.click(screen.getByRole('button', {name: 'Create'}));

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith({id: 'created'});
    });
  });

  test('calls onError when creating a user fails', async () => {
    const error = new Error('Create failed');
    const create = testing.fn().mockRejectedValue(error);
    const onError = testing.fn();
    const gmp = createGmp({create});
    const {render} = rendererWith({gmp, router: true});

    const TestComponent = () => {
      const mutation = useCreateUser({onError});
      return <button onClick={() => mutation.mutate(userData)}>Create</button>;
    };

    render(<TestComponent />);
    fireEvent.click(screen.getByRole('button', {name: 'Create'}));

    await waitFor(() => {
      expect(onError).toHaveBeenCalled();
      expect(onError.mock.calls[0][0]).toBe(error);
    });
  });
});

describe('useSaveUser', () => {
  test('forwards accessHosts arrays and derives oldName when saving', async () => {
    const save = testing.fn().mockResolvedValue({data: {id: 'saved'}});
    const gmp = createGmp({save});
    const {render} = rendererWith({gmp, router: true});

    const TestComponent = () => {
      const mutation = useSaveUser();
      return (
        <button onClick={() => mutation.mutate({...userData, id: 'user-id'})}>
          Save
        </button>
      );
    };

    render(<TestComponent />);
    fireEvent.click(screen.getByRole('button', {name: 'Save'}));

    await waitFor(() => {
      expect(save).toHaveBeenCalledWith({
        ...userData,
        id: 'user-id',
        oldName: userData.name,
      });
    });
  });

  test('preserves an explicit oldName when saving', async () => {
    const save = testing.fn().mockResolvedValue({data: {id: 'saved'}});
    const gmp = createGmp({save});
    const {render} = rendererWith({gmp, router: true});

    const TestComponent = () => {
      const mutation = useSaveUser();
      return (
        <button
          onClick={() =>
            mutation.mutate({
              ...userData,
              id: 'user-id',
              oldName: 'previous-user',
            })
          }
        >
          Save
        </button>
      );
    };

    render(<TestComponent />);
    fireEvent.click(screen.getByRole('button', {name: 'Save'}));

    await waitFor(() => {
      expect(save).toHaveBeenCalledWith({
        ...userData,
        id: 'user-id',
        oldName: 'previous-user',
      });
    });
  });

  test('calls onSuccess with saved user data', async () => {
    const save = testing.fn().mockResolvedValue({data: {id: 'saved'}});
    const onSuccess = testing.fn();
    const gmp = createGmp({save});
    const {render} = rendererWith({gmp, router: true});

    const TestComponent = () => {
      const mutation = useSaveUser({onSuccess});
      return (
        <button onClick={() => mutation.mutate({...userData, id: 'user-id'})}>
          Save
        </button>
      );
    };

    render(<TestComponent />);
    fireEvent.click(screen.getByRole('button', {name: 'Save'}));

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith({id: 'saved'});
    });
  });

  test('calls onError when saving a user fails', async () => {
    const error = new Error('Save failed');
    const save = testing.fn().mockRejectedValue(error);
    const onError = testing.fn();
    const gmp = createGmp({save});
    const {render} = rendererWith({gmp, router: true});

    const TestComponent = () => {
      const mutation = useSaveUser({onError});
      return (
        <button onClick={() => mutation.mutate({...userData, id: 'user-id'})}>
          Save
        </button>
      );
    };

    render(<TestComponent />);
    fireEvent.click(screen.getByRole('button', {name: 'Save'}));

    await waitFor(() => {
      expect(onError).toHaveBeenCalled();
      expect(onError.mock.calls[0][0]).toBe(error);
    });
  });
});

describe('remaining user mutation hooks', () => {
  test('should clone a user', async () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp, router: true});

    const TestComponent = () => {
      const mutation = useCloneUser();
      return (
        <button onClick={() => mutation.mutate({id: 'user-id'})}>Clone</button>
      );
    };

    render(<TestComponent />);
    fireEvent.click(screen.getByRole('button', {name: 'Clone'}));

    await waitFor(() => {
      expect(gmp.user.clone).toHaveBeenCalledWith({id: 'user-id'});
    });
  });

  test('should delete a user and forward the inheritor ID', async () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp, router: true});

    const TestComponent = () => {
      const mutation = useDeleteUser();
      return (
        <button
          onClick={() =>
            mutation.mutate({id: 'user-id', inheritorId: 'inheritor-id'})
          }
        >
          Delete
        </button>
      );
    };

    render(<TestComponent />);
    fireEvent.click(screen.getByRole('button', {name: 'Delete'}));

    await waitFor(() => {
      expect(gmp.user.delete).toHaveBeenCalledWith({
        id: 'user-id',
        inheritorId: 'inheritor-id',
      });
    });
  });

  test('should bulk delete users with options', async () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp, router: true});
    const input = {
      users: [user],
      options: {inheritor_id: 'inheritor-id'},
    };

    const TestComponent = () => {
      const mutation = useBulkDeleteUsers();
      return <button onClick={() => mutation.mutate(input)}>Delete</button>;
    };

    render(<TestComponent />);
    fireEvent.click(screen.getByRole('button', {name: 'Delete'}));

    await waitFor(() => {
      expect(gmp.users.delete).toHaveBeenCalledWith(input.users, input.options);
    });
  });

  test('should download a user', async () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp, router: true});

    const TestComponent = () => {
      const mutation = useDownloadUser();
      return (
        <button onClick={() => mutation.mutate({id: 'user-id'})}>
          Download
        </button>
      );
    };

    render(<TestComponent />);
    fireEvent.click(screen.getByRole('button', {name: 'Download'}));

    await waitFor(() => {
      expect(gmp.user.export).toHaveBeenCalledWith({id: 'user-id'});
    });
  });

  test('should bulk export users by entity list and filter', async () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp, router: true});

    const TestComponent = () => {
      const mutation = useBulkExportUsers();
      return (
        <>
          <button onClick={() => mutation.mutate([user])}>Users</button>
          <button onClick={() => mutation.mutate(userFilter)}>Filter</button>
        </>
      );
    };

    render(<TestComponent />);
    fireEvent.click(screen.getByRole('button', {name: 'Users'}));
    fireEvent.click(screen.getByRole('button', {name: 'Filter'}));

    await waitFor(() => {
      expect(gmp.users.export).toHaveBeenCalledWith([user]);
      expect(gmp.users.exportByFilter).toHaveBeenCalledWith(userFilter);
    });
  });
});

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
  useGetUsers,
} from 'web/hooks/use-query/users';

const user = new User({id: 'user-id', name: 'user'});
const userFilter = QueryFilter.fromString('name~user');

const createGmp = (
  userMethods: Record<string, unknown> = {},
  token = 'test-token',
) => ({
  session: createSession({token}),
  settings: {},
  user: userMethods,
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

describe('useGetUsers', () => {
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
});

describe('useBulkDeleteUsers', () => {
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

  test('should call onError when deleting users fails', async () => {
    const error = new Error('Delete failed');
    const gmp = createGmp();
    gmp.users.delete.mockRejectedValue(error);
    const onError = testing.fn();
    const {render} = rendererWith({gmp, router: true});
    const TestComponent = () => {
      const mutation = useBulkDeleteUsers({onError});
      return (
        <button
          onClick={() =>
            mutation.mutate({users: [user], options: {inheritor_id: 'id'}})
          }
        >
          Delete
        </button>
      );
    };
    render(<TestComponent />);
    fireEvent.click(screen.getByRole('button', {name: 'Delete'}));
    await waitFor(() => expect(onError).toHaveBeenCalledWith(error));
  });
});

describe('useBulkExportUsers', () => {
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

  test('should call onError when exporting users fails', async () => {
    const error = new Error('Export failed');
    const gmp = createGmp();
    gmp.users.export.mockRejectedValue(error);
    const onError = testing.fn();
    const {render} = rendererWith({gmp, router: true});
    const TestComponent = () => {
      const mutation = useBulkExportUsers({onError});
      return <button onClick={() => mutation.mutate([user])}>Export</button>;
    };
    render(<TestComponent />);
    fireEvent.click(screen.getByRole('button', {name: 'Export'}));
    await waitFor(() => expect(onError).toHaveBeenCalledWith(error));
  });
});

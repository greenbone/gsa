/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {rendererWith, screen, waitFor} from 'web/testing';
import CollectionCounts from 'gmp/collection/collection-counts';
import Filter from 'gmp/models/filter';
import Permission from 'gmp/models/permission';
import {createSession} from 'gmp/testing';
import {useGetPermissions} from 'web/hooks/use-query/permissions';

const permission1 = Permission.fromElement({
  _id: 'perm-1',
  name: 'get_tasks',
  resource: {_id: 'task-1', type: 'task'},
  subject: {_id: 'user-1', type: 'user'},
});

const permission2 = Permission.fromElement({
  _id: 'perm-2',
  name: 'modify_task',
  resource: {_id: 'task-1', type: 'task'},
  subject: {_id: 'user-1', type: 'user'},
});

const filter = Filter.fromString('resource_uuid=task-1').all();

const TestComponent = ({filter}: {filter?: Filter}) => {
  const {data, isLoading, isError} = useGetPermissions({filter});

  if (isLoading) {
    return <div data-testid="loading">Loading...</div>;
  }
  if (isError) {
    return <div data-testid="error">Error</div>;
  }
  if (!data) {
    return <div data-testid="no-data">No data</div>;
  }

  return (
    <div data-testid="permissions">
      {data.entities.map(perm => (
        <div key={perm.id} data-testid="permission">
          {perm.name}
        </div>
      ))}
    </div>
  );
};

const createGmp = () => ({
  session: createSession({token: 'test-token'}),
  settings: {},
  permissions: {
    get: testing.fn().mockResolvedValue({
      data: [permission1, permission2],
      meta: {
        filter,
        counts: new CollectionCounts({all: 2, filtered: 2, length: 2}),
      },
    }),
  },
});

describe('useGetPermissions', () => {
  test('should fetch permissions with a filter', async () => {
    const gmp = createGmp();

    const {render} = rendererWith({gmp, router: true});
    render(<TestComponent filter={filter} />);

    await waitFor(() => {
      expect(screen.getAllByTestId('permission')).toHaveLength(2);
    });

    expect(gmp.permissions.get).toHaveBeenCalled();
    expect(screen.getByText('get_tasks')).toBeInTheDocument();
    expect(screen.getByText('modify_task')).toBeInTheDocument();
  });

  test('should show loading state initially', () => {
    const gmp = createGmp();

    const {render} = rendererWith({gmp, router: true});
    render(<TestComponent />);

    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });
});

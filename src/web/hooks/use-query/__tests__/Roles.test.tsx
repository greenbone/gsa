/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test, testing} from '@gsa/testing';
import {rendererWith, screen, waitFor} from 'web/testing';
import CollectionCounts from 'gmp/collection/collection-counts';
import QueryFilter from 'gmp/models/filter/query-filter';
import {createSession} from 'gmp/testing';
import {useGetAllRoles, useGetRoles} from 'web/hooks/use-query/roles';

const filter = QueryFilter.fromString('name~role');
const roles = [{id: 'role-1', name: 'Role 1'}];

const createGmp = () => {
  const response = {
    data: roles,
    meta: {
      filter,
      counts: new CollectionCounts({all: 1, filtered: 1, length: 1}),
    },
  };

  return {
    session: createSession({token: 'test-token'}),
    settings: {},
    roles: {
      get: testing.fn().mockResolvedValue(response),
      getAll: testing.fn().mockResolvedValue(response),
    },
  };
};

describe('role query hooks', () => {
  test('should fetch roles with a filter', async () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp, router: true});

    const TestComponent = () => {
      const {data} = useGetRoles({filter});
      return <div data-testid="role">{data?.entities[0]?.name}</div>;
    };

    render(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByTestId('role')).toHaveTextContent('Role 1');
    });

    expect(gmp.roles.get).toHaveBeenCalledWith({filter});
    expect(gmp.roles.getAll).not.toHaveBeenCalled();
  });

  test('should fetch all roles with a filter', async () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp, router: true});

    const TestComponent = () => {
      const {data} = useGetAllRoles({filter});
      return <div data-testid="role">{data?.entities[0]?.name}</div>;
    };

    render(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByTestId('role')).toHaveTextContent('Role 1');
    });

    expect(gmp.roles.getAll).toHaveBeenCalledWith({filter});
    expect(gmp.roles.get).not.toHaveBeenCalled();
  });

  test('should not fetch roles when disabled', () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp, router: true});

    const TestComponent = () => {
      useGetRoles({enabled: false});
      useGetAllRoles({enabled: false});
      return <div />;
    };

    render(<TestComponent />);

    expect(gmp.roles.get).not.toHaveBeenCalled();
    expect(gmp.roles.getAll).not.toHaveBeenCalled();
  });

  test('should not fetch roles without a session token', () => {
    const gmp = createGmp();
    gmp.session.token = undefined;
    const {render} = rendererWith({gmp, router: true});

    const TestComponent = () => {
      useGetRoles({filter});
      useGetAllRoles({filter});
      return <div />;
    };

    render(<TestComponent />);

    expect(gmp.roles.get).not.toHaveBeenCalled();
    expect(gmp.roles.getAll).not.toHaveBeenCalled();
  });
});

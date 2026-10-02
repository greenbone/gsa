/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test, testing} from '@gsa/testing';
import {rendererWith, screen, waitFor} from 'web/testing';
import CollectionCounts from 'gmp/collection/collection-counts';
import QueryFilter from 'gmp/models/filter/query-filter';
import {createSession} from 'gmp/testing';
import {useGetAllGroups, useGetGroups} from 'web/hooks/use-query/groups';

const filter = QueryFilter.fromString('name~group');
const groups = [{id: 'group-1', name: 'Group 1'}];

const createGmp = () => {
  const response = {
    data: groups,
    meta: {
      filter,
      counts: new CollectionCounts({all: 1, filtered: 1, length: 1}),
    },
  };

  return {
    session: createSession({token: 'test-token'}),
    settings: {},
    groups: {
      get: testing.fn().mockResolvedValue(response),
      getAll: testing.fn().mockResolvedValue(response),
    },
  };
};

describe('group query hooks', () => {
  test('should fetch groups with a filter', async () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp, router: true});

    const TestComponent = () => {
      const {data} = useGetGroups({filter});
      return <div data-testid="group">{data?.entities[0]?.name}</div>;
    };

    render(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByTestId('group')).toHaveTextContent('Group 1');
    });

    expect(gmp.groups.get).toHaveBeenCalledWith({filter});
    expect(gmp.groups.getAll).not.toHaveBeenCalled();
  });

  test('should fetch all groups with a filter', async () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp, router: true});

    const TestComponent = () => {
      const {data} = useGetAllGroups({filter});
      return <div data-testid="group">{data?.entities[0]?.name}</div>;
    };

    render(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByTestId('group')).toHaveTextContent('Group 1');
    });

    expect(gmp.groups.getAll).toHaveBeenCalledWith({filter});
    expect(gmp.groups.get).not.toHaveBeenCalled();
  });

  test('should not fetch groups when disabled', () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp, router: true});

    const TestComponent = () => {
      useGetGroups({enabled: false});
      useGetAllGroups({enabled: false});
      return <div />;
    };

    render(<TestComponent />);

    expect(gmp.groups.get).not.toHaveBeenCalled();
    expect(gmp.groups.getAll).not.toHaveBeenCalled();
  });

  test('should not fetch groups without a session token', () => {
    const gmp = createGmp();
    gmp.session.token = undefined;
    const {render} = rendererWith({gmp, router: true});

    const TestComponent = () => {
      useGetGroups({filter});
      useGetAllGroups({filter});
      return <div />;
    };

    render(<TestComponent />);

    expect(gmp.groups.get).not.toHaveBeenCalled();
    expect(gmp.groups.getAll).not.toHaveBeenCalled();
  });
});

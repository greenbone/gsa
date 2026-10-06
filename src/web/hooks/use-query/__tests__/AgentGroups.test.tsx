/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test, testing} from '@gsa/testing';
import {rendererWith, screen, waitFor} from 'web/testing';
import CollectionCounts from 'gmp/collection/collection-counts';
import QueryFilter from 'gmp/models/filter/query-filter';
import {createSession} from 'gmp/testing';
import {useGetAgentGroups} from 'web/hooks/use-query/agent-groups';

const filter = QueryFilter.fromString('name~group');
const group = {id: 'group-1', name: 'Agent Group 1'};

const createGmp = () => ({
  session: createSession({token: 'test-token'}),
  settings: {},
  agentgroups: {
    get: testing.fn().mockResolvedValue({
      data: [group],
      meta: {
        filter,
        counts: new CollectionCounts({all: 1, filtered: 1, length: 1}),
      },
    }),
  },
});

describe('useGetAgentGroups', () => {
  test('should fetch agent groups with a filter', async () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp, router: true});

    const TestComponent = () => {
      const {data} = useGetAgentGroups({filter});
      return <div data-testid="group">{data?.entities[0]?.name}</div>;
    };

    render(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByTestId('group')).toHaveTextContent('Agent Group 1');
    });

    expect(gmp.agentgroups.get).toHaveBeenCalledWith({filter});
  });
});

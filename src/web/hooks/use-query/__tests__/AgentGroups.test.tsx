/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test, testing} from '@gsa/testing';
import {fireEvent, rendererWith, screen, waitFor} from 'web/testing';
import CollectionCounts from 'gmp/collection/collection-counts';
import QueryFilter from 'gmp/models/filter/query-filter';
import {createSession} from 'gmp/testing';
import {
  useCloneAgentGroup,
  useCreateAgentGroup,
  useDeleteAgentGroup,
  useGetAgentGroups,
  useSaveAgentGroup,
} from 'web/hooks/use-query/agent-groups';

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
  agentgroup: {
    create: testing.fn().mockResolvedValue({data: {id: 'group-2'}}),
    clone: testing.fn().mockResolvedValue({data: {id: 'group-2'}}),
    save: testing.fn().mockResolvedValue(undefined),
    delete: testing.fn().mockResolvedValue(undefined),
  },
});

describe('agent group query hooks', () => {
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

  test.each([
    ['create', useCreateAgentGroup, 'create', {name: 'New Group'}],
    ['clone', useCloneAgentGroup, 'clone', {id: 'group-1'}],
    ['save', useSaveAgentGroup, 'save', {id: 'group-1', name: 'Saved Group'}],
    ['delete', useDeleteAgentGroup, 'delete', {id: 'group-1'}],
  ])('should %s an agent group', async (_name, useMutation, method, input) => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp, router: true});

    const TestComponent = () => {
      const mutation = useMutation({});
      return (
        <button onClick={() => mutation.mutate(input as never)}>Run</button>
      );
    };

    render(<TestComponent />);
    fireEvent.click(screen.getByRole('button', {name: 'Run'}));

    await waitFor(() => {
      expect(gmp.agentgroup[method].mock.calls[0][0]).toEqual(input);
    });
  });
});

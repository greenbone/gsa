/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test, testing} from '@gsa/testing';
import {fireEvent, rendererWith, screen, waitFor} from 'web/testing';
import Agent from 'gmp/models/agent';
import QueryFilter from 'gmp/models/filter/query-filter';
import {createSession} from 'gmp/testing';
import {
  useBulkAuthorizeAgents,
  useBulkDeleteAgents,
  useBulkDisableUpdateToLatestAgents,
  useBulkEnableUpdateToLatestAgents,
  useBulkRevokeAgents,
  useGetAgents,
  useSyncAgents,
} from 'web/hooks/use-query/agents';

const filter = QueryFilter.fromString('name~agent');
const agent = new Agent({id: 'agent-1', name: 'Agent 1'});

const createGmp = () => ({
  session: createSession({token: 'test-token'}),
  settings: {},
  agents: {
    get: testing.fn().mockResolvedValue({
      data: [agent],
      meta: {filter, counts: {all: 1, filtered: 1, length: 1}},
    }),
    delete: testing.fn().mockResolvedValue(undefined),
    deleteByFilter: testing.fn().mockResolvedValue(undefined),
    authorize: testing.fn().mockResolvedValue(undefined),
    authorizeByFilter: testing.fn().mockResolvedValue(undefined),
    revoke: testing.fn().mockResolvedValue(undefined),
    revokeByFilter: testing.fn().mockResolvedValue(undefined),
    enableUpdateToLatest: testing.fn().mockResolvedValue(undefined),
    enableUpdateToLatestByFilter: testing.fn().mockResolvedValue(undefined),
    disableUpdateToLatest: testing.fn().mockResolvedValue(undefined),
    disableUpdateToLatestByFilter: testing.fn().mockResolvedValue(undefined),
    sync: testing.fn().mockResolvedValue(undefined),
  },
  agent: {
    save: testing.fn().mockResolvedValue(undefined),
    delete: testing.fn().mockResolvedValue(undefined),
    downloadSupportBundle: testing
      .fn()
      .mockResolvedValue({data: new ArrayBuffer(0)}),
  },
});

describe('useGetAgents', () => {
  test('should fetch agents with filter, scanner, and authorization filters', async () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp, router: true});

    const TestComponent = () => {
      const {data} = useGetAgents({
        filter,
        scannerId: 'scanner-1',
        authorized: true,
      });

      return <div data-testid="agent">{data?.entities[0]?.name}</div>;
    };

    render(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByTestId('agent')).toHaveTextContent('Agent 1');
    });

    expect(gmp.agents.get).toHaveBeenCalled();
    const [{filter: requestFilter}] = gmp.agents.get.mock.calls[0];
    expect(requestFilter.toFilterString()).toContain('name~agent');
    expect(requestFilter.toFilterString()).toContain('scanner_uuid=scanner-1');
    expect(requestFilter.toFilterString()).toContain('authorized=1');
  });

  test('should not fetch when disabled', () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp, router: true});

    const TestComponent = () => {
      useGetAgents({enabled: false});
      return <div />;
    };

    render(<TestComponent />);

    expect(gmp.agents.get).not.toHaveBeenCalled();
  });
});

describe('useBulkDeleteAgents', () => {
  test('should delete agents by entity list and filter', async () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp, router: true});

    const TestComponent = () => {
      const mutation = useBulkDeleteAgents({});
      return (
        <>
          <button onClick={() => mutation.mutate([agent])}>
            Delete agents
          </button>
          <button onClick={() => mutation.mutate(filter)}>Delete filter</button>
        </>
      );
    };

    render(<TestComponent />);
    fireEvent.click(screen.getByRole('button', {name: 'Delete agents'}));
    fireEvent.click(screen.getByRole('button', {name: 'Delete filter'}));

    await waitFor(() => {
      expect(gmp.agents.delete).toHaveBeenCalledWith([agent]);
      expect(gmp.agents.deleteByFilter).toHaveBeenCalledWith(filter);
    });
  });
});

describe('useBulkAuthorizeAgents', () => {
  test('should authorize agents by entity list and filter', async () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp, router: true});
    const TestComponent = () => {
      const mutation = useBulkAuthorizeAgents({});
      return (
        <>
          <button onClick={() => mutation.mutate([agent])}>Entities</button>
          <button onClick={() => mutation.mutate(filter)}>Filter</button>
        </>
      );
    };
    render(<TestComponent />);
    fireEvent.click(screen.getByRole('button', {name: 'Entities'}));
    fireEvent.click(screen.getByRole('button', {name: 'Filter'}));
    await waitFor(() => {
      expect(gmp.agents.authorize).toHaveBeenCalledWith([agent]);
      expect(gmp.agents.authorizeByFilter).toHaveBeenCalledWith(filter);
    });
  });
});

describe('useBulkRevokeAgents', () => {
  test('should revoke agents by entity list and filter', async () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp, router: true});
    const TestComponent = () => {
      const mutation = useBulkRevokeAgents({});
      return (
        <>
          <button onClick={() => mutation.mutate([agent])}>Entities</button>
          <button onClick={() => mutation.mutate(filter)}>Filter</button>
        </>
      );
    };
    render(<TestComponent />);
    fireEvent.click(screen.getByRole('button', {name: 'Entities'}));
    fireEvent.click(screen.getByRole('button', {name: 'Filter'}));
    await waitFor(() => {
      expect(gmp.agents.revoke).toHaveBeenCalledWith([agent]);
      expect(gmp.agents.revokeByFilter).toHaveBeenCalledWith(filter);
    });
  });
});

describe('useBulkEnableUpdateToLatestAgents', () => {
  test('should enable automatic updates by entity list and filter', async () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp, router: true});
    const TestComponent = () => {
      const mutation = useBulkEnableUpdateToLatestAgents({});
      return (
        <>
          <button onClick={() => mutation.mutate([agent])}>Entities</button>
          <button onClick={() => mutation.mutate(filter)}>Filter</button>
        </>
      );
    };
    render(<TestComponent />);
    fireEvent.click(screen.getByRole('button', {name: 'Entities'}));
    fireEvent.click(screen.getByRole('button', {name: 'Filter'}));
    await waitFor(() => {
      expect(gmp.agents.enableUpdateToLatest).toHaveBeenCalledWith([agent]);
      expect(gmp.agents.enableUpdateToLatestByFilter).toHaveBeenCalledWith(
        filter,
      );
    });
  });
});

describe('useBulkDisableUpdateToLatestAgents', () => {
  test('should disable automatic updates by entity list and filter', async () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp, router: true});
    const TestComponent = () => {
      const mutation = useBulkDisableUpdateToLatestAgents({});
      return (
        <>
          <button onClick={() => mutation.mutate([agent])}>Entities</button>
          <button onClick={() => mutation.mutate(filter)}>Filter</button>
        </>
      );
    };
    render(<TestComponent />);
    fireEvent.click(screen.getByRole('button', {name: 'Entities'}));
    fireEvent.click(screen.getByRole('button', {name: 'Filter'}));
    await waitFor(() => {
      expect(gmp.agents.disableUpdateToLatest).toHaveBeenCalledWith([agent]);
      expect(gmp.agents.disableUpdateToLatestByFilter).toHaveBeenCalledWith(
        filter,
      );
    });
  });
});

describe('useSyncAgents', () => {
  test('should sync agents', async () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp, router: true});

    const TestComponent = () => {
      const mutation = useSyncAgents();
      return <button onClick={() => mutation.mutate()}>Sync</button>;
    };

    render(<TestComponent />);
    fireEvent.click(screen.getByRole('button', {name: 'Sync'}));

    await waitFor(() => {
      expect(gmp.agents.sync).toHaveBeenCalledWith();
    });
  });
});

/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test, testing} from '@gsa/testing';
import {rendererWith, screen, waitFor} from 'web/testing';
import CollectionCounts from 'gmp/collection/collection-counts';
import AgentInstaller from 'gmp/models/agent-installer';
import QueryFilter from 'gmp/models/filter/query-filter';
import {createSession} from 'gmp/testing';
import {useGetAgentInstallers} from 'web/hooks/use-query/agent-installers';

const filter = QueryFilter.fromString('name~agent');

const installers = [
  new AgentInstaller({id: 'installer-1', name: 'Agent Installer 1'}),
  new AgentInstaller({id: 'installer-2', name: 'Agent Installer 2'}),
];

const InstallersComponent = ({enabled}: {enabled?: boolean}) => {
  const {data} = useGetAgentInstallers({enabled, filter});

  return (
    <div data-testid="installers">
      {data?.entities.map(installer => (
        <div key={installer.id} data-testid="installer">
          {installer.name}
        </div>
      ))}
    </div>
  );
};

const createGmp = ({token}: {token?: string} = {token: 'test-token'}) => ({
  session: createSession({token}),
  settings: {},
  agentinstallers: {
    get: testing.fn().mockResolvedValue({
      data: installers,
      meta: {
        filter,
        counts: new CollectionCounts({all: 2, filtered: 2, length: 2}),
      },
    }),
  },
});

describe('useGetAgentInstallers', () => {
  test('should fetch agent installers with a filter', async () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp, router: true});

    render(<InstallersComponent />);

    await waitFor(() => {
      expect(screen.getAllByTestId('installer')).toHaveLength(2);
    });

    expect(gmp.agentinstallers.get).toHaveBeenCalledWith({filter});
    expect(screen.getByText('Agent Installer 1')).toBeInTheDocument();
    expect(screen.getByText('Agent Installer 2')).toBeInTheDocument();
  });

  test('should not fetch when there is no session token', () => {
    const gmp = createGmp({token: undefined});
    const {render} = rendererWith({gmp, router: true});

    render(<InstallersComponent />);

    expect(gmp.agentinstallers.get).not.toHaveBeenCalled();
  });

  test('should not fetch when disabled', () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp, router: true});

    render(<InstallersComponent enabled={false} />);

    expect(gmp.agentinstallers.get).not.toHaveBeenCalled();
  });
});

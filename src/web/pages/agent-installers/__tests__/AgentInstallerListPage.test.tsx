/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test, testing} from '@gsa/testing';
import {fireEvent, rendererWith, screen, wait} from 'web/testing';
import EverythingCapabilities from 'gmp/capabilities/everything';
import CollectionCounts from 'gmp/collection/collection-counts';
import AgentInstaller from 'gmp/models/agent-installer';
import Filter from 'gmp/models/filter';
import {createSession} from 'gmp/testing';
import AgentInstallerListPage from 'web/pages/agent-installers/AgentInstallerListPage';

const makeInstaller = (id = 'i1') =>
  new AgentInstaller({
    id,
    name: `Agent Installer ${id}`,
    description: `Description for ${id}`,
    version: '1.0.0',
    checksum: 'abc123',
    userCapabilities: new EverythingCapabilities(),
  });

const createGmp = ({
  getAgentInstallers = testing.fn().mockResolvedValue({
    data: [makeInstaller('i1')],
    meta: {
      filter: Filter.fromString(),
      counts: new CollectionCounts({
        first: 1,
        all: 1,
        filtered: 1,
        length: 1,
        rows: 10,
      }),
    },
  }),
} = {}) => ({
  agentinstallers: {
    get: getAgentInstallers,
  },
  agentinstaller: {
    download: testing.fn().mockResolvedValue({data: 'file-content'}),
  },
  settings: {},
  session: createSession({token: 'token'}),
  filters: {
    get: testing.fn().mockResolvedValue({
      data: [],
      meta: {counts: new CollectionCounts()},
    }),
  },
  user: {
    getSetting: testing.fn().mockResolvedValue({value: 10}),
    saveSetting: testing.fn().mockResolvedValue(undefined),
  },
  trashcan: {
    get: testing.fn().mockResolvedValue({
      data: [],
      meta: {counts: new CollectionCounts()},
    }),
  },
});

describe('AgentInstallerListPage tests', () => {
  test('renders full AgentInstallerListPage with data and toolbar', async () => {
    const gmp = createGmp();

    const {render} = rendererWith({
      capabilities: true,
      gmp,
    });

    render(<AgentInstallerListPage />);

    await wait();

    expect(screen.getByText('Agent Installers 1 of 1')).toBeInTheDocument();
    expect(screen.getByText('Agent Installer i1')).toBeInTheDocument();
    expect(gmp.agentinstallers.get).toHaveBeenCalled();
  });

  test('renders empty state when no installers are available', async () => {
    const counts = new CollectionCounts({
      first: 0,
      all: 0,
      filtered: 0,
      length: 0,
      rows: 10,
    });

    const getAgentInstallers = testing.fn().mockResolvedValue({
      data: [],
      meta: {filter: Filter.fromString(), counts},
    });

    const gmp = createGmp({getAgentInstallers});
    const {render} = rendererWith({
      capabilities: true,
      gmp,
    });

    render(<AgentInstallerListPage />);

    await wait();

    expect(
      screen.getByText('No agent installers available'),
    ).toBeInTheDocument();
  });

  test('handles download action', async () => {
    const gmp = createGmp();

    const {render} = rendererWith({
      capabilities: true,
      gmp,
    });

    render(<AgentInstallerListPage />);

    await wait();

    const downloadButton = screen.getByTestId('export-icon');
    fireEvent.click(downloadButton);

    await wait();

    expect(gmp.agentinstaller.download).toHaveBeenCalledWith('i1');
  });

  test('displays filter dialog when filter button is clicked', async () => {
    const gmp = createGmp();

    const {render} = rendererWith({
      capabilities: new EverythingCapabilities(),
      gmp,
    });

    render(<AgentInstallerListPage />);

    await wait();

    const filterButton = screen.getByTestId('powerfilter-edit');
    fireEvent.click(filterButton);

    expect(screen.getByText('Update Filter')).toBeInTheDocument();
  });
});

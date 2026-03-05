/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test, testing} from '@gsa/testing';
import {fireEvent, rendererWith, screen, wait} from 'web/testing';
import EverythingCapabilities from 'gmp/capabilities/everything';
import Agent from 'gmp/models/agent';
import Date from 'gmp/models/date';
import AgentsListPageToolBarIcons from 'web/pages/agents/AgentListPageToolBarIcons';

const syncMock = testing.fn().mockResolvedValue(undefined);

const gmp = {
  settings: {
    manualUrl: 'https://docs.greenbone.net',
  },
  agents: {
    sync: syncMock,
  },
};

const onError = testing.fn();

describe('AgentsListPageToolBarIcons tests', () => {
  test('should render toolbar icons', () => {
    const {render} = rendererWith({
      capabilities: true,
      gmp,
    });

    render(<AgentsListPageToolBarIcons onError={onError} />);

    expect(screen.getByTestId('help-icon')).toBeInTheDocument();
    expect(screen.getByTestId('refresh-ccw-icon')).toBeInTheDocument();
  });

  test('should call sync when sync icon is clicked', async () => {
    const {render} = rendererWith({capabilities: true, gmp});

    render(<AgentsListPageToolBarIcons onError={onError} />);

    fireEvent.click(screen.getByTitle('Sync Agents'));

    await wait();

    expect(syncMock).toHaveBeenCalledTimes(1);
  });

  test('should not render last updated when agents have no modificationTime', () => {
    const {render} = rendererWith({capabilities: true, gmp});

    render(
      <AgentsListPageToolBarIcons
        agents={[
          new Agent({
            id: '1',
            name: 'Agent 1',
            userCapabilities: new EverythingCapabilities(),
          }),
        ]}
        onError={onError}
      />,
    );

    expect(screen.queryByText(/Last updated/i)).not.toBeInTheDocument();
  });

  test('should not render last updated when agents is not set', () => {
    const {render} = rendererWith({capabilities: true, gmp});

    render(<AgentsListPageToolBarIcons onError={onError} />);

    expect(screen.queryByText(/Last updated/i)).not.toBeInTheDocument();
  });

  test('should render last updated using the most recent agent modificationTime', () => {
    const {render} = rendererWith({capabilities: true, gmp});

    render(
      <AgentsListPageToolBarIcons
        agents={[
          new Agent({
            id: '1',
            name: 'Agent 1',
            modificationTime: Date('2026-01-01T10:00:00Z'),
            userCapabilities: new EverythingCapabilities(),
          }),
          new Agent({
            id: '2',
            name: 'Agent 2',
            modificationTime: Date('2026-03-04T14:32:05Z'),
            userCapabilities: new EverythingCapabilities(),
          }),
        ]}
        onError={onError}
      />,
    );

    expect(screen.getByText(/Last updated/i)).toBeInTheDocument();
  });
});

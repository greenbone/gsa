/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test, testing} from '@gsa/testing';
import {fireEvent, rendererWith, screen, wait} from 'web/testing';
import EverythingCapabilities from 'gmp/capabilities/everything';
import Agent from 'gmp/models/agent';
import AgentListPage from 'web/pages/agents/AgentListPage';

const makeAgent = (
  id = 'a1',
  name = 'Agent 1',
  authorized = false,
  hostname = '192.168.1.1',
) =>
  new Agent({
    id,
    name,
    comment: 'Test agent',
    authorized,
    hostname,
    userCapabilities: new EverythingCapabilities(),
  });

const authorizeMock = testing.fn().mockResolvedValue(undefined);
const revokeMock = testing.fn().mockResolvedValue(undefined);

const createMockGmp = ({
  getAgents = testing.fn().mockResolvedValue({
    data: [
      makeAgent('1', 'Agent 1', true, '192.168.1.1'),
      makeAgent('2', 'Agent 2', false, '192.168.1.2'),
    ],
    meta: {},
  }),
  authorize = authorizeMock,
  revoke = revokeMock,
} = {}) => ({
  settings: {
    token: 'token',
    manualUrl: 'https://docs.greenbone.net',
    reloadInterval: 30000,
  },
  agents: {
    get: getAgents,
    authorize,
    revoke,
  },
  agent: {
    delete: testing.fn().mockResolvedValue(undefined),
    save: testing.fn().mockResolvedValue(undefined),
    modify: testing.fn().mockResolvedValue(undefined),
  },
  dashboard: {
    getSetting: testing.fn().mockResolvedValue({}),
  },
  filters: {
    get: testing.fn().mockResolvedValue({
      data: [],
      meta: {},
    }),
  },
  user: {
    getSetting: testing.fn().mockResolvedValue({data: null}),
    currentSettings: testing.fn().mockResolvedValue({
      detailsExportFileName: 'foo',
    }),
  },
});

const gmp = createMockGmp();

describe('AgentListPage tests', () => {
  test('should display loading indicator initially', () => {
    const gmp = createMockGmp({
      getAgents: testing.fn().mockImplementation(
        () =>
          new Promise(() => {
            // Never resolve to simulate loading
          }),
      ),
    });

    const {render} = rendererWith({
      capabilities: new EverythingCapabilities(),
      gmp,
    });

    render(<AgentListPage />);

    const entitiesLoading = screen.getAllByTestId('loading')[1];

    expect(entitiesLoading).toBeInTheDocument();
  });

  test('should render empty state when no agents are available', async () => {
    const gmp = createMockGmp({
      getAgents: testing.fn().mockResolvedValue({
        data: [],
        meta: {},
      }),
    });

    const {render} = rendererWith({
      capabilities: new EverythingCapabilities(),
      gmp,
    });

    render(<AgentListPage />);

    expect(screen.getByText('Agents')).toBeInTheDocument();

    expect(await screen.findByText('No agents available')).toBeInTheDocument();
  });

  test('should handle bulk authorize on page contents', async () => {
    const {render} = rendererWith({gmp, capabilities: true});

    render(<AgentListPage />);

    await screen.findByText(/Agent 1/i);

    const authorizeIcon = screen.getByTitle('Authorize all items on this page');
    fireEvent.click(authorizeIcon);

    const dialog = await screen.findByRole('dialog');
    expect(dialog).toBeVisible();

    const authorizeButton = screen.getByText('Authorize');
    fireEvent.click(authorizeButton);

    await wait();
    expect(authorizeMock).toHaveBeenCalled();
  });

  test('should handle bulk revoke on page contents', async () => {
    const {render} = rendererWith({gmp, capabilities: true});

    render(<AgentListPage />);

    await screen.findByText(/Agent 1/i);

    const revokeIcon = screen.getByTitle('Revoke all items on this page');
    fireEvent.click(revokeIcon);

    const dialog = await screen.findByRole('dialog');
    expect(dialog).toBeVisible();

    const revokeButton = screen.getByText('Revoke');
    fireEvent.click(revokeButton);

    await wait();
    expect(revokeMock).toHaveBeenCalled();
  });

  test('shows error notification when bulk authorize fails', async () => {
    authorizeMock.mockRejectedValue(new Error('boom'));

    const gmp = createMockGmp({
      authorize: authorizeMock,
    });

    const {render} = rendererWith({gmp, capabilities: true});

    render(<AgentListPage />);

    await screen.findByText(/Agent 1/i);

    const authorizeIcon = screen.getByTitle('Authorize all items on this page');
    fireEvent.click(authorizeIcon);

    const dialog = await screen.findByRole('dialog');
    expect(dialog).toBeVisible();

    const authorizeButton = screen.getByText('Authorize');
    fireEvent.click(authorizeButton);

    expect(authorizeMock).toHaveBeenCalled();

    await wait();
    const errorDialog = await screen.findByRole('dialog');
    expect(errorDialog).toBeVisible();
    expect(errorDialog.textContent).toMatch(/boom|An error occurred/i);
  });

  test('shows error notification when bulk revoke fails', async () => {
    revokeMock.mockRejectedValue(new Error('boom'));

    const gmp = createMockGmp({
      revoke: revokeMock,
    });

    const {render} = rendererWith({gmp, capabilities: true});

    render(<AgentListPage />);

    await screen.findByText(/Agent 1/i);

    const revokeIcon = screen.getByTitle('Revoke all items on this page');
    fireEvent.click(revokeIcon);

    const dialog = await screen.findByRole('dialog');
    expect(dialog).toBeVisible();

    const revokeButton = screen.getByText('Revoke');
    fireEvent.click(revokeButton);

    expect(revokeMock).toHaveBeenCalled();

    await wait();
    const errorDialog = await screen.findByRole('dialog');
    expect(errorDialog).toBeVisible();
    expect(errorDialog.textContent).toMatch(/boom|An error occurred/i);
  });
});

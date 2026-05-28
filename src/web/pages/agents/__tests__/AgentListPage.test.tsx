/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {beforeEach, describe, expect, test, testing} from '@gsa/testing';
import {fireEvent, rendererWith, screen, wait} from 'web/testing';
import EverythingCapabilities from 'gmp/capabilities/everything';
import Agent from 'gmp/models/agent';
import Date, {type Date as GmpDate} from 'gmp/models/date';
import {createSession} from 'gmp/testing';
import AgentListPage from 'web/pages/agents/AgentListPage';

const makeAgent = (
  id = 'a1',
  name = 'Agent 1',
  authorized = false,
  hostname = '192.168.1.1',
  modificationTime?: GmpDate,
) =>
  new Agent({
    id,
    name,
    comment: 'Test agent',
    authorized,
    hostname,
    modificationTime,
    userCapabilities: new EverythingCapabilities(),
  });

const authorizeMock = testing.fn().mockResolvedValue(undefined);
const revokeMock = testing.fn().mockResolvedValue(undefined);
const syncMock = testing.fn().mockResolvedValue(undefined);
const enableUpdateToLatestMock = testing.fn().mockResolvedValue(undefined);
const disableUpdateToLatestMock = testing.fn().mockResolvedValue(undefined);

const createGmp = ({
  getAgents = testing.fn().mockResolvedValue({
    data: [
      makeAgent('1', 'Agent 1', true, '192.168.1.1'),
      makeAgent('2', 'Agent 2', false, '192.168.1.2'),
    ],
    meta: {},
  }),
  authorize = authorizeMock,
  revoke = revokeMock,
  sync = syncMock,
  enableUpdateToLatest = enableUpdateToLatestMock,
  disableUpdateToLatest = disableUpdateToLatestMock,
} = {}) => ({
  settings: {
    manualUrl: 'https://docs.greenbone.net',
    reloadInterval: 30000,
  },
  session: createSession({token: 'token'}),
  agents: {
    get: getAgents,
    authorize,
    revoke,
    sync,
    enableUpdateToLatest,
    disableUpdateToLatest,
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

const gmp = createGmp();

describe('AgentListPage tests', () => {
  beforeEach(() => {
    authorizeMock.mockClear();
    revokeMock.mockClear();
    syncMock.mockClear();
    enableUpdateToLatestMock.mockClear();
    disableUpdateToLatestMock.mockClear();
  });

  test('should display loading indicator initially', () => {
    const gmp = createGmp({
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

    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });

  test('should render empty state when no agents are available', async () => {
    const gmp = createGmp({
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
    authorizeMock.mockRejectedValueOnce(new Error('Authorize failed'));

    const gmp = createGmp();
    const {render} = rendererWith({gmp, capabilities: true});

    render(<AgentListPage />);

    await screen.findByText(/Agent 1/i);

    const authorizeIcon = screen.getByTitle('Authorize all items on this page');
    fireEvent.click(authorizeIcon);

    const dialog = await screen.findByRole('dialog');
    expect(dialog).toBeVisible();

    const authorizeButton = screen.getByRole('button', {
      name: 'Authorize',
    });
    fireEvent.click(authorizeButton);

    await wait();

    expect(authorizeMock).toHaveBeenCalled();
  });

  test('shows error notification when bulk revoke fails', async () => {
    revokeMock.mockRejectedValueOnce(new Error('Revoke failed'));

    const gmp = createGmp();
    const {render} = rendererWith({gmp, capabilities: true});

    render(<AgentListPage />);

    await screen.findByText(/Agent 1/i);

    const revokeIcon = screen.getByTitle('Revoke all items on this page');
    fireEvent.click(revokeIcon);

    const dialog = await screen.findByRole('dialog');
    expect(dialog).toBeVisible();

    const revokeButton = screen.getByRole('button', {
      name: 'Revoke',
    });
    fireEvent.click(revokeButton);

    await wait();

    expect(revokeMock).toHaveBeenCalled();
  });

  test('should not show last updated when agents have no modificationTime', async () => {
    const gmp = createGmp({
      getAgents: testing.fn().mockResolvedValue({
        data: [makeAgent('1', 'Agent 1'), makeAgent('2', 'Agent 2')],
        meta: {},
      }),
    });

    const {render} = rendererWith({gmp, capabilities: true});

    render(<AgentListPage />);

    await screen.findByText(/Agent 1/i);

    expect(screen.queryByText(/Last updated/i)).not.toBeInTheDocument();
  });

  test('should show last updated using the most recent modificationTime', async () => {
    const olderDate = Date('2026-01-01T10:00:00Z');
    const newerDate = Date('2026-02-01T10:00:00Z');

    const gmp = createGmp({
      getAgents: testing.fn().mockResolvedValue({
        data: [
          makeAgent('1', 'Agent 1', false, '192.168.1.1', olderDate),
          makeAgent('2', 'Agent 2', false, '192.168.1.2', newerDate),
        ],
        meta: {},
      }),
    });

    const {render} = rendererWith({gmp, capabilities: true});

    render(<AgentListPage />);

    await screen.findByText(/Agent 1/i);

    expect(screen.getByText(/Last updated/i)).toBeInTheDocument();
  });

  test('should handle bulk enable update to latest on page contents', async () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp, capabilities: true});

    render(<AgentListPage />);

    await screen.findByText(/Agent 1/i);

    const enableIcon = screen.getByTitle(
      'Enable automatic update to latest for all items on this page',
    );
    fireEvent.click(enableIcon);

    const dialog = await screen.findByRole('dialog');
    expect(dialog).toBeVisible();

    const enableButton = screen.getByText('Enable automatic Update to Latest');
    fireEvent.click(enableButton);

    await wait();

    expect(enableUpdateToLatestMock).toHaveBeenCalled();
  });

  test('should handle bulk disable update to latest on page contents', async () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp, capabilities: true});

    render(<AgentListPage />);

    await screen.findByText(/Agent 1/i);

    const disableIcon = screen.getByTitle(
      'Disable automatic update to latest for all items on this page',
    );
    fireEvent.click(disableIcon);

    const dialog = screen.getDialog();
    expect(dialog).toBeVisible();

    const disableButton = screen.getByText(
      'Disable automatic Update to Latest',
    );
    fireEvent.click(disableButton);

    await wait();

    expect(disableUpdateToLatestMock).toHaveBeenCalled();
  });
});

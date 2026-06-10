/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {beforeEach, describe, expect, test, testing} from '@gsa/testing';
import {fireEvent, rendererWith, screen, wait} from 'web/testing';
import Scanner, {
  AGENT_CONTROLLER_SENSOR_SCANNER_TYPE,
} from 'gmp/models/scanner';
import {createSession} from 'gmp/testing';
import AgentInstallInstructionsPage from 'web/pages/agent-remote-installer/AgentInstallInstructionsPage';
import {type InstallInstructionsData} from 'web/pages/agent-remote-installer/types';

const makeScanner = (
  id: string,
  name: string,
  host: string,
  port: number,
  scannerType?: string,
): Scanner =>
  new Scanner({
    id,
    name,
    host,
    port,
    scannerType: scannerType as Scanner['scannerType'],
  });

const mockInstructionsData: InstallInstructionsData = {
  _version: '1.0',
  lang: 'en',
  title: 'Agent Installation',
  sections: [
    {
      id: 'heading-1',
      type: 'heading',
      level: 2,
      text: 'Quick Install',
    },
  ],
};

const getInstructionsMock = testing
  .fn()
  .mockResolvedValue({data: mockInstructionsData});

const createGmp = ({
  getAllScanners = testing.fn().mockResolvedValue({
    data: [makeScanner('scanner-1', 'Local Controller', 'agentcontrol', 443)],
  }),
  getInstructions = getInstructionsMock,
} = {}) => ({
  settings: {
    manualUrl: 'https://docs.greenbone.net',
    reloadInterval: 30000,
  },
  session: createSession({token: 'test-token'}),
  scanners: {
    getAll: getAllScanners,
  },
  agentinstallersinstructions: {
    getInstructions,
  },
});

describe('AgentInstallInstructionsPage tests', () => {
  beforeEach(() => {
    getInstructionsMock.mockClear();
  });

  test('should display loading indicator initially', () => {
    const gmp = createGmp({
      getAllScanners: testing.fn().mockImplementation(
        () =>
          new Promise(() => {
            // Never resolve to simulate loading
          }),
      ),
    });

    const {render} = rendererWith({gmp, capabilities: true});
    render(<AgentInstallInstructionsPage />);

    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });

  test('should show "No agent controllers available" when no controllers exist', async () => {
    const gmp = createGmp({
      getAllScanners: testing.fn().mockResolvedValue({data: []}),
    });

    const {render} = rendererWith({gmp, capabilities: true});
    render(<AgentInstallInstructionsPage />);

    await screen.findByText('No agent controllers available');
  });

  test('should render page title and section heading after data loads', async () => {
    const gmp = createGmp();

    const {render} = rendererWith({gmp, capabilities: true});
    render(<AgentInstallInstructionsPage />);

    await screen.findByText('Agent Installation');
    expect(screen.getByText('Quick Install')).toBeInTheDocument();
  });

  test('should show controller selector when multiple controllers are available', async () => {
    const gmp = createGmp({
      getAllScanners: testing.fn().mockResolvedValue({
        data: [
          makeScanner('scanner-1', 'Local Controller', 'agentcontrol', 443),
          makeScanner('scanner-2', 'Remote Controller', '10.0.0.1', 443),
        ],
      }),
    });

    const {render} = rendererWith({gmp, capabilities: true});
    render(<AgentInstallInstructionsPage />);

    await screen.findByText(/Agent Controller/i);
    expect(
      screen.getByText('Local Controller (agentcontrol:443)'),
    ).toBeInTheDocument();
  });

  test('should render selector as disabled when only one controller is available', async () => {
    const gmp = createGmp();

    const {render} = rendererWith({gmp, capabilities: true});
    render(<AgentInstallInstructionsPage />);

    await screen.findByText(/Agent Controller/i);

    const select = screen.getByTestId('form-select');
    expect(select).toBeDisabled();
  });

  test('should show error message when scanners request fails', async () => {
    const gmp = createGmp({
      getAllScanners: testing
        .fn()
        .mockRejectedValue(new Error('Network error')),
    });

    const {render} = rendererWith({gmp, capabilities: true});
    render(<AgentInstallInstructionsPage />);

    await screen.findByText('Could not load install instructions');
    expect(screen.getByText('Network error')).toBeInTheDocument();
    expect(screen.getByRole('button', {name: 'Retry'})).toBeInTheDocument();
  });

  test('should show error message when instructions request fails', async () => {
    const gmp = createGmp({
      getInstructions: testing
        .fn()
        .mockRejectedValue(new Error('Instructions unavailable')),
    });

    const {render} = rendererWith({gmp, capabilities: true});
    render(<AgentInstallInstructionsPage />);

    await screen.findByText('Could not load install instructions');
    expect(screen.getByRole('button', {name: 'Retry'})).toBeInTheDocument();
  });

  test('should call getInstructions again when Retry button is clicked', async () => {
    const mockGetInstructions = testing
      .fn()
      .mockRejectedValueOnce(new Error('Instructions unavailable'))
      .mockResolvedValue({data: mockInstructionsData});

    const gmp = createGmp({getInstructions: mockGetInstructions});

    const {render} = rendererWith({gmp, capabilities: true});
    render(<AgentInstallInstructionsPage />);

    const retryButton = await screen.findByRole('button', {name: 'Retry'});
    fireEvent.click(retryButton);

    await wait();

    expect(mockGetInstructions).toHaveBeenCalledTimes(2);
  });

  test('should call getInstructions with first controllerId and show all options', async () => {
    const mockGetInstructions = testing
      .fn()
      .mockResolvedValue({data: mockInstructionsData});

    const gmp = createGmp({
      getAllScanners: testing.fn().mockResolvedValue({
        data: [
          makeScanner('scanner-1', 'Local Controller', 'agentcontrol', 443),
          makeScanner('scanner-2', 'Remote Controller', '10.0.0.1', 443),
        ],
      }),
      getInstructions: mockGetInstructions,
    });

    const {render} = rendererWith({gmp, capabilities: true});
    render(<AgentInstallInstructionsPage />);

    // Wait for both controllers and instructions to fully load
    await screen.findByText('Agent Installation');

    expect(mockGetInstructions).toHaveBeenCalledWith(
      expect.objectContaining({scannerId: 'scanner-1'}),
    );

    // Both options should be available in the dropdown portal
    const options = screen.getAllByRole('option', {hidden: true});
    expect(options).toHaveLength(2);
    expect(options[0]).toHaveTextContent('Local Controller (agentcontrol:443)');
    expect(options[1]).toHaveTextContent('Remote Controller (10.0.0.1:443)');
  });

  test('should show sensor warning when selected controller is an agent sensor', async () => {
    const gmp = createGmp({
      getAllScanners: testing.fn().mockResolvedValue({
        data: [
          makeScanner(
            'scanner-1',
            'Sensor Controller',
            '10.0.0.2',
            443,
            AGENT_CONTROLLER_SENSOR_SCANNER_TYPE,
          ),
        ],
      }),
    });

    const {render} = rendererWith({gmp, capabilities: true});
    render(<AgentInstallInstructionsPage />);

    await screen.findByTestId('agent-sensor-warning');
    expect(screen.getByTestId('agent-sensor-warning')).toBeInTheDocument();
    expect(screen.getByText('Sensor Network Notice')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Please run these commands on the selected sensor network only; do not execute them on the master node.',
      ),
    ).toBeInTheDocument();
  });

  test('should not show sensor warning when selected controller is not an agent sensor', async () => {
    const gmp = createGmp();

    const {render} = rendererWith({gmp, capabilities: true});
    render(<AgentInstallInstructionsPage />);

    await screen.findByText('Agent Installation');

    expect(
      screen.queryByTestId('agent-sensor-warning'),
    ).not.toBeInTheDocument();
  });
});

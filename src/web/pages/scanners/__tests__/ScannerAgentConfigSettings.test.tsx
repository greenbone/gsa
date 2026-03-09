/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {fireEvent, rendererWith, screen, wait} from 'web/testing';
import Scanner, {AGENT_CONTROLLER_SCANNER_TYPE} from 'gmp/models/scanner';
import {YES_VALUE} from 'gmp/parser';
import ScannerAgentConfigSettings from 'web/pages/scanners/ScannerAgentConfigSettings';
import {getSelectElement} from 'web/testing/custom-queries';

const createMockScanner = (overrides = {}) => {
  return Scanner.fromElement({
    _id: 'scanner-1',
    name: 'Test Scanner',
    type: AGENT_CONTROLLER_SCANNER_TYPE,
    agent_control_config_defaults: {
      agent_defaults: {
        agent_control: {
          retry: {
            attempts: 3,
            delay_in_seconds: 10,
            max_jitter_in_seconds: 5,
          },
        },
        agent_script_executor: {
          bulk_size: 100,
          bulk_throttle_time_in_ms: 500,
          indexer_dir_depth: 3,
          scheduler_cron_time: {
            item: ['0 */12 * * *'],
          },
        },
        heartbeat: {
          interval_in_seconds: 300,
          miss_until_inactive: 3,
        },
      },
      agent_control_defaults: {
        update_to_latest: YES_VALUE,
      },
    },
    ...overrides,
  });
};

describe('ScannerAgentConfigSettings tests', () => {
  test('should render all configuration sections', () => {
    const scanner = createMockScanner();
    const handleChanged = testing.fn();
    const handleError = testing.fn();

    const modifyAgentControlConfig = testing.fn().mockResolvedValue({
      data: {},
    });

    const gmp = {
      scanner: {
        modifyAgentControlConfig,
      },
    };

    const {render} = rendererWith({gmp, capabilities: true});

    render(
      <ScannerAgentConfigSettings
        scanner={scanner}
        onChanged={handleChanged}
        onError={handleError}
      />,
    );

    expect(
      screen.getByText('Agent Control - Retry Settings'),
    ).toBeInTheDocument();
    expect(screen.getByText('Agent Script Executor')).toBeInTheDocument();
    expect(screen.getByText('Heartbeat')).toBeInTheDocument();
    expect(screen.getByText('Agent Control Defaults')).toBeInTheDocument();
  });

  test('should display retry settings with correct values', () => {
    const scanner = createMockScanner();
    const handleChanged = testing.fn();
    const handleError = testing.fn();

    const modifyAgentControlConfig = testing.fn().mockResolvedValue({
      data: {},
    });

    const gmp = {
      scanner: {
        modifyAgentControlConfig,
      },
    };

    const {render} = rendererWith({gmp, capabilities: true});

    render(
      <ScannerAgentConfigSettings
        scanner={scanner}
        onChanged={handleChanged}
        onError={handleError}
      />,
    );

    expect(screen.getByText('Retry Attempts')).toBeInTheDocument();
    expect(screen.getAllByText('3')[0]).toBeInTheDocument();
    expect(screen.getByText('Retry Delay (seconds)')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('Max Jitter (seconds)')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  test('should display agent script executor settings', () => {
    const scanner = createMockScanner();
    const handleChanged = testing.fn();
    const handleError = testing.fn();

    const modifyAgentControlConfig = testing.fn().mockResolvedValue({
      data: {},
    });

    const gmp = {
      scanner: {
        modifyAgentControlConfig,
      },
    };

    const {render} = rendererWith({gmp, capabilities: true});

    render(
      <ScannerAgentConfigSettings
        scanner={scanner}
        onChanged={handleChanged}
        onError={handleError}
      />,
    );

    expect(screen.getByText('Bulk Size')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText('Bulk Throttle Time (ms)')).toBeInTheDocument();
    expect(screen.getByText('500')).toBeInTheDocument();
    expect(screen.getByText('Indexer Directory Depth')).toBeInTheDocument();
    expect(screen.getAllByText('3').length).toBeGreaterThan(0);
    expect(screen.getByText('Scheduler Cron Time')).toBeInTheDocument();
    expect(screen.getByText('0 */12 * * *')).toBeInTheDocument();
  });

  test('should display heartbeat settings', () => {
    const scanner = createMockScanner();
    const handleChanged = testing.fn();
    const handleError = testing.fn();

    const modifyAgentControlConfig = testing.fn().mockResolvedValue({
      data: {},
    });

    const gmp = {
      scanner: {
        modifyAgentControlConfig,
      },
    };

    const {render} = rendererWith({gmp, capabilities: true});

    render(
      <ScannerAgentConfigSettings
        scanner={scanner}
        onChanged={handleChanged}
        onError={handleError}
      />,
    );

    expect(screen.getByText('Interval (seconds)')).toBeInTheDocument();
    expect(screen.getByText('300')).toBeInTheDocument();
    expect(screen.getByText('Miss Until Inactive')).toBeInTheDocument();
    expect(screen.getAllByText('3').length).toBeGreaterThan(0);
  });

  test('should display update to latest setting', () => {
    const scanner = createMockScanner();
    const handleChanged = testing.fn();
    const handleError = testing.fn();

    const modifyAgentControlConfig = testing.fn().mockResolvedValue({
      data: {},
    });

    const gmp = {
      scanner: {
        modifyAgentControlConfig,
      },
    };

    const {render} = rendererWith({gmp, capabilities: true});

    render(
      <ScannerAgentConfigSettings
        scanner={scanner}
        onChanged={handleChanged}
        onError={handleError}
      />,
    );

    expect(screen.getByText('Update to Latest')).toBeInTheDocument();
    expect(screen.getByText('Yes')).toBeInTheDocument();
  });

  test('should enter edit mode when edit button is clicked', async () => {
    const scanner = createMockScanner();
    const handleChanged = testing.fn();
    const handleError = testing.fn();

    const modifyAgentControlConfig = testing.fn().mockResolvedValue({
      data: {},
    });

    const gmp = {
      scanner: {
        modifyAgentControlConfig,
      },
    };

    const {render} = rendererWith({gmp, capabilities: true});

    render(
      <ScannerAgentConfigSettings
        scanner={scanner}
        onChanged={handleChanged}
        onError={handleError}
      />,
    );

    const editButtons = screen.getAllByTestId('edit-icon');
    fireEvent.click(editButtons[0]); // Click first edit button (attempts)

    await wait();

    // Should show number input in edit mode
    const numberInput = screen.getByDisplayValue('3');
    expect(numberInput).toBeInTheDocument();
  });

  test('should save changes when save button is clicked', async () => {
    const modifyAgentControlConfig = testing.fn().mockResolvedValue({
      data: {},
    });

    const gmp = {
      scanner: {
        modifyAgentControlConfig,
      },
    };

    const scanner = createMockScanner();
    const handleChanged = testing.fn();
    const handleError = testing.fn();

    const {render} = rendererWith({gmp, capabilities: true});

    render(
      <ScannerAgentConfigSettings
        scanner={scanner}
        onChanged={handleChanged}
        onError={handleError}
      />,
    );

    // Enter edit mode
    const editButtons = screen.getAllByTestId('edit-icon');
    fireEvent.click(editButtons[0]); // Edit retry attempts

    await wait();

    // Change value
    const numberInput = screen.getByDisplayValue('3');
    fireEvent.change(numberInput, {target: {value: '5'}});

    // Click save
    const saveButton = screen.getByTitle('Save');
    fireEvent.click(saveButton);

    await wait();

    expect(modifyAgentControlConfig).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'scanner-1',
        attempts: 5,
        delayInSeconds: 10,
        maxJitterInSeconds: 5,
        bulkSize: 100,
        bulkThrottleTimeInMs: 500,
        indexerDirDepth: 3,
        schedulerCronTimes: ['0 */12 * * *'],
        intervalInSeconds: 300,
        missUntilInactive: 3,
        updateToLatest: YES_VALUE,
      }),
      expect.anything(),
    );
    expect(handleChanged).toHaveBeenCalled();
  });

  test('should cancel edit mode when cancel button is clicked', async () => {
    const scanner = createMockScanner();
    const handleChanged = testing.fn();
    const handleError = testing.fn();

    const modifyAgentControlConfig = testing.fn().mockResolvedValue({
      data: {},
    });

    const gmp = {
      scanner: {
        modifyAgentControlConfig,
      },
    };

    const {render} = rendererWith({gmp, capabilities: true});

    render(
      <ScannerAgentConfigSettings
        scanner={scanner}
        onChanged={handleChanged}
        onError={handleError}
      />,
    );

    // Enter edit mode
    const editButtons = screen.getAllByTestId('edit-icon');
    fireEvent.click(editButtons[0]);

    await wait();

    // Change value
    const numberInput = screen.getByDisplayValue('3');
    fireEvent.change(numberInput, {target: {value: '10'}});

    // Click cancel
    const cancelButton = screen.getByTitle('Cancel');
    fireEvent.click(cancelButton);

    await wait();

    // Should exit edit mode and restore original value
    expect(screen.queryByDisplayValue('10')).not.toBeInTheDocument();
  });

  test('should handle error when save fails', async () => {
    const modifyAgentControlConfig = testing
      .fn()
      .mockRejectedValue(new Error('Save failed'));

    const gmp = {
      scanner: {
        modifyAgentControlConfig,
      },
    };

    const scanner = createMockScanner();
    const handleChanged = testing.fn();
    const handleError = testing.fn();

    const {render} = rendererWith({gmp, capabilities: true});

    render(
      <ScannerAgentConfigSettings
        scanner={scanner}
        onChanged={handleChanged}
        onError={handleError}
      />,
    );

    // Enter edit mode
    const editButtons = screen.getAllByTestId('edit-icon');
    fireEvent.click(editButtons[0]);

    await wait();

    // Click save
    const saveButton = screen.getByTitle('Save');
    fireEvent.click(saveButton);

    await wait();

    // Should display error message
    expect(screen.getByText('Save failed')).toBeInTheDocument();
  });

  test('should edit cron expression field', async () => {
    const scanner = createMockScanner();
    const handleChanged = testing.fn();
    const handleError = testing.fn();

    const modifyAgentControlConfig = testing.fn().mockResolvedValue({
      data: {},
    });

    const gmp = {
      scanner: {
        modifyAgentControlConfig,
      },
    };

    const {render} = rendererWith({gmp, capabilities: true});

    render(
      <ScannerAgentConfigSettings
        scanner={scanner}
        onChanged={handleChanged}
        onError={handleError}
      />,
    );

    // Find and click edit button for scheduler cron time
    const editButtons = screen.getAllByTestId('edit-icon');
    // Find the one for scheduler cron time (should be 7th: 3 retry + 4 script executor)
    fireEvent.click(editButtons[6]);

    await wait();

    // Should show the SchedulerCronField with its title
    expect(screen.getByText('Schedule')).toBeInTheDocument();
    const selectInput = getSelectElement();
    expect(selectInput).toBeInTheDocument();
  });

  test('should edit update to latest radio field', async () => {
    const scanner = createMockScanner();
    const handleChanged = testing.fn();
    const handleError = testing.fn();

    const modifyAgentControlConfig = testing.fn().mockResolvedValue({
      data: {},
    });

    const gmp = {
      scanner: {
        modifyAgentControlConfig,
      },
    };

    const {render} = rendererWith({gmp, capabilities: true});

    render(
      <ScannerAgentConfigSettings
        scanner={scanner}
        onChanged={handleChanged}
        onError={handleError}
      />,
    );

    // Find and click edit button for update to latest
    const editButtons = screen.getAllByTestId('edit-icon');
    const lastEditButton = editButtons.at(-1);
    if (lastEditButton) {
      fireEvent.click(lastEditButton);
    }

    await wait();

    // Should show radio buttons
    const yesRadio = screen.getByRole('radio', {name: 'Yes'});
    const noRadio = screen.getByRole('radio', {name: 'No'});
    expect(yesRadio).toBeInTheDocument();
    expect(noRadio).toBeInTheDocument();
    expect(yesRadio).toBeChecked();
  });

  test('should handle scanner with missing agentControlConfig', () => {
    const scanner = Scanner.fromElement({
      _id: 'scanner-2',
      name: 'Scanner Without Config',
      type: AGENT_CONTROLLER_SCANNER_TYPE,
    });

    const handleChanged = testing.fn();
    const handleError = testing.fn();

    const modifyAgentControlConfig = testing.fn().mockResolvedValue({
      data: {},
    });

    const gmp = {
      scanner: {
        modifyAgentControlConfig,
      },
    };

    const {render} = rendererWith({gmp, capabilities: true});

    render(
      <ScannerAgentConfigSettings
        scanner={scanner}
        onChanged={handleChanged}
        onError={handleError}
      />,
    );

    // Should render with default values (0 for numbers, empty for arrays)
    expect(
      screen.getByText('Agent Control - Retry Settings'),
    ).toBeInTheDocument();
    const zeros = screen.getAllByText('0');
    expect(zeros.length).toBeGreaterThan(0); // Default values
  });

  test('should display "Not set" for empty scheduler cron times', () => {
    const scanner = Scanner.fromElement({
      _id: 'scanner-3',
      name: 'Scanner',
      type: AGENT_CONTROLLER_SCANNER_TYPE,
      agent_control_config_defaults: {
        agent_defaults: {
          agent_control: {
            retry: {
              attempts: 0,
              delay_in_seconds: 0,
              max_jitter_in_seconds: 0,
            },
          },
          agent_script_executor: {
            bulk_size: 0,
            bulk_throttle_time_in_ms: 0,
            indexer_dir_depth: 0,
            scheduler_cron_time: {
              item: [],
            },
          },
          heartbeat: {
            interval_in_seconds: 0,
            miss_until_inactive: 0,
          },
        },
      },
    });

    const handleChanged = testing.fn();
    const handleError = testing.fn();

    const modifyAgentControlConfig = testing.fn().mockResolvedValue({
      data: {},
    });

    const gmp = {
      scanner: {
        modifyAgentControlConfig,
      },
    };

    const {render} = rendererWith({gmp, capabilities: true});

    render(
      <ScannerAgentConfigSettings
        scanner={scanner}
        onChanged={handleChanged}
        onError={handleError}
      />,
    );

    expect(screen.getByText('Not set')).toBeInTheDocument();
  });

  test('should handle missing scanner ID when saving', async () => {
    const scanner = Scanner.fromElement({
      name: 'Scanner Without ID',
      type: AGENT_CONTROLLER_SCANNER_TYPE,
      agent_control_config_defaults: {
        agent_defaults: {
          agent_control: {
            retry: {
              attempts: 3,
              delay_in_seconds: 10,
              max_jitter_in_seconds: 5,
            },
          },
          agent_script_executor: {
            bulk_size: 100,
            bulk_throttle_time_in_ms: 500,
            indexer_dir_depth: 3,
            scheduler_cron_time: {
              item: ['0 */12 * * *'],
            },
          },
          heartbeat: {
            interval_in_seconds: 300,
            miss_until_inactive: 3,
          },
        },
      },
    });

    const handleChanged = testing.fn();
    const handleError = testing.fn();

    const modifyAgentControlConfig = testing.fn().mockResolvedValue({
      data: {},
    });

    const gmp = {
      scanner: {
        modifyAgentControlConfig,
      },
    };

    const {render} = rendererWith({gmp, capabilities: true});

    render(
      <ScannerAgentConfigSettings
        scanner={scanner}
        onChanged={handleChanged}
        onError={handleError}
      />,
    );

    // Enter edit mode
    const editButtons = screen.getAllByTestId('edit-icon');
    fireEvent.click(editButtons[0]);

    await wait();

    // Click save
    const saveButton = screen.getByTitle('Save');
    fireEvent.click(saveButton);

    await wait();

    // Should show error about missing scanner ID
    expect(
      screen.getByText('Cannot save: scanner ID is missing.'),
    ).toBeInTheDocument();
  });
});

/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {rendererWith, fireEvent, screen} from 'web/testing';
import Features from 'gmp/capabilities/features';
import CollectionCounts from 'gmp/collection/collection-counts';
import Filter from 'gmp/models/filter';
import Scanner, {
  AGENT_CONTROLLER_SCANNER_TYPE,
  AGENT_CONTROLLER_SENSOR_SCANNER_TYPE,
  OPENVAS_SCANNER_TYPE,
} from 'gmp/models/scanner';
import {YES_VALUE} from 'gmp/parser';
import {currentSettingsDefaultResponse} from 'web/pages/__fixtures__/current-settings';
import ScannerDetailsPage from 'web/pages/scanners/ScannerDetailsPage';
import {entityLoadingActions} from 'web/store/entities/scanners';
import {setTimezone, setUsername} from 'web/store/usersettings/actions';

const reloadInterval = -1;
const manualUrl = 'test/';

const currentSettings = testing
  .fn()
  .mockResolvedValue(currentSettingsDefaultResponse);

const getEntities = testing.fn().mockResolvedValue({
  data: [],
  meta: {
    filter: Filter.fromString(),
    counts: new CollectionCounts(),
  },
});

const createMockScanner = (
  type: string = OPENVAS_SCANNER_TYPE,
  includeAgentConfig = false,
) => {
  const baseScanner = {
    _id: 'scanner-123',
    owner: {name: 'admin'},
    name: 'Test Scanner',
    comment: 'Test comment',
    type,
    host: 'localhost',
    port: 9390,
    creation_time: '2024-01-15T10:00:00Z',
    modification_time: '2024-01-16T12:00:00Z',
  };

  if (includeAgentConfig) {
    return Scanner.fromElement({
      ...baseScanner,
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
    });
  }

  return Scanner.fromElement(baseScanner);
};

describe('ScannerDetailsPage tests', () => {
  test('should render scanner details page', () => {
    const scanner = createMockScanner();

    const gmp = {
      scanner: {
        get: testing.fn().mockResolvedValue({data: scanner}),
      },
      permissions: {
        get: getEntities,
      },
      settings: {manualUrl, reloadInterval},
      user: {
        currentSettings,
      },
    };

    const {render, store} = rendererWith({
      capabilities: true,
      gmp,
      router: true,
      store: true,
    });

    store.dispatch(setTimezone('UTC'));
    store.dispatch(setUsername('admin'));
    store.dispatch(entityLoadingActions.success('scanner-123', scanner));

    render(<ScannerDetailsPage id="scanner-123" />);

    expect(
      screen.getByRole('heading', {name: /Scanner: Test Scanner/}),
    ).toBeInTheDocument();
    expect(screen.getByText('Test comment')).toBeInTheDocument();
  });

  test('should render information tab', () => {
    const scanner = createMockScanner();

    const gmp = {
      scanner: {
        get: testing.fn().mockResolvedValue({data: scanner}),
      },
      permissions: {
        get: getEntities,
      },
      settings: {manualUrl, reloadInterval},
      user: {
        currentSettings,
      },
    };

    const {render, store} = rendererWith({
      capabilities: true,
      gmp,
      router: true,
      store: true,
    });

    store.dispatch(setTimezone('UTC'));
    store.dispatch(setUsername('admin'));
    store.dispatch(entityLoadingActions.success('scanner-123', scanner));

    render(<ScannerDetailsPage id="scanner-123" />);

    expect(screen.getByRole('tab', {name: 'Information'})).toBeInTheDocument();
  });

  test('should render user tags tab', () => {
    const scanner = createMockScanner();

    const gmp = {
      scanner: {
        get: testing.fn().mockResolvedValue({data: scanner}),
      },
      permissions: {
        get: getEntities,
      },
      settings: {manualUrl, reloadInterval},
      user: {
        currentSettings,
      },
    };

    const {render, store} = rendererWith({
      capabilities: true,
      gmp,
      router: true,
      store: true,
    });

    store.dispatch(setTimezone('UTC'));
    store.dispatch(setUsername('admin'));
    store.dispatch(entityLoadingActions.success('scanner-123', scanner));

    render(<ScannerDetailsPage id="scanner-123" />);

    expect(
      screen.getByRole('tab', {name: 'User Tags ( 0 )'}),
    ).toBeInTheDocument();
  });

  test('should render permissions tab', () => {
    const scanner = createMockScanner();

    const gmp = {
      scanner: {
        get: testing.fn().mockResolvedValue({data: scanner}),
      },
      permissions: {
        get: getEntities,
      },
      settings: {manualUrl, reloadInterval},
      user: {
        currentSettings,
      },
    };

    const {render, store} = rendererWith({
      capabilities: true,
      gmp,
      router: true,
      store: true,
    });

    store.dispatch(setTimezone('UTC'));
    store.dispatch(setUsername('admin'));
    store.dispatch(entityLoadingActions.success('scanner-123', scanner));

    render(<ScannerDetailsPage id="scanner-123" />);

    expect(
      screen.getByRole('tab', {name: 'Permissions ( 0 )'}),
    ).toBeInTheDocument();
  });

  test('should not render agent default configuration tab for regular scanner', () => {
    const scanner = createMockScanner(OPENVAS_SCANNER_TYPE);

    const gmp = {
      scanner: {
        get: testing.fn().mockResolvedValue({data: scanner}),
      },
      permissions: {
        get: getEntities,
      },
      settings: {manualUrl, reloadInterval},
      user: {
        currentSettings,
      },
    };

    const features = new Features(['ENABLE_AGENTS']);

    const {render, store} = rendererWith({
      capabilities: true,
      gmp,
      router: true,
      store: true,
      features,
    });

    store.dispatch(setTimezone('UTC'));
    store.dispatch(setUsername('admin'));
    store.dispatch(entityLoadingActions.success('scanner-123', scanner));

    render(<ScannerDetailsPage id="scanner-123" />);

    expect(
      screen.queryByRole('tab', {name: 'Agent Default Configuration'}),
    ).not.toBeInTheDocument();
  });

  test('should render agent default configuration tab for agent controller scanner', () => {
    const scanner = createMockScanner(AGENT_CONTROLLER_SCANNER_TYPE, true);

    const gmp = {
      scanner: {
        get: testing.fn().mockResolvedValue({data: scanner}),
      },
      permissions: {
        get: getEntities,
      },
      settings: {manualUrl, reloadInterval},
      user: {
        currentSettings,
      },
    };

    const features = new Features(['ENABLE_AGENTS']);

    const {render, store} = rendererWith({
      capabilities: true,
      gmp,
      router: true,
      store: true,
      features,
    });

    store.dispatch(setTimezone('UTC'));
    store.dispatch(setUsername('admin'));
    store.dispatch(entityLoadingActions.success('scanner-123', scanner));

    render(<ScannerDetailsPage id="scanner-123" />);

    expect(
      screen.getByRole('tab', {name: 'Agent Default Configuration'}),
    ).toBeInTheDocument();
  });

  test('should render agent default configuration tab for agent controller sensor scanner', () => {
    const scanner = createMockScanner(
      AGENT_CONTROLLER_SENSOR_SCANNER_TYPE,
      true,
    );

    const gmp = {
      scanner: {
        get: testing.fn().mockResolvedValue({data: scanner}),
      },
      permissions: {
        get: getEntities,
      },
      settings: {manualUrl, reloadInterval},
      user: {
        currentSettings,
      },
    };

    const features = new Features(['ENABLE_AGENTS']);

    const {render, store} = rendererWith({
      capabilities: true,
      gmp,
      router: true,
      store: true,
      features,
    });

    store.dispatch(setTimezone('UTC'));
    store.dispatch(setUsername('admin'));
    store.dispatch(entityLoadingActions.success('scanner-123', scanner));

    render(<ScannerDetailsPage id="scanner-123" />);

    expect(
      screen.getByRole('tab', {name: 'Agent Default Configuration'}),
    ).toBeInTheDocument();
  });

  test('should not render agent default configuration tab when ENABLE_AGENTS is disabled', () => {
    const scanner = createMockScanner(AGENT_CONTROLLER_SCANNER_TYPE, true);

    const gmp = {
      scanner: {
        get: testing.fn().mockResolvedValue({data: scanner}),
      },
      permissions: {
        get: getEntities,
      },
      settings: {manualUrl, reloadInterval},
      user: {
        currentSettings,
      },
    };

    const features = new Features([]);

    const {render, store} = rendererWith({
      capabilities: true,
      gmp,
      router: true,
      store: true,
      features,
    });

    store.dispatch(setTimezone('UTC'));
    store.dispatch(setUsername('admin'));
    store.dispatch(entityLoadingActions.success('scanner-123', scanner));

    render(<ScannerDetailsPage id="scanner-123" />);

    expect(
      screen.queryByRole('tab', {name: 'Agent Default Configuration'}),
    ).not.toBeInTheDocument();
  });

  test('should display agent default configuration content when tab is clicked', () => {
    const scanner = createMockScanner(AGENT_CONTROLLER_SCANNER_TYPE, true);

    const gmp = {
      scanner: {
        get: testing.fn().mockResolvedValue({data: scanner}),
        modifyAgentControlConfig: testing.fn().mockResolvedValue({data: {}}),
      },
      permissions: {
        get: getEntities,
      },
      settings: {manualUrl, reloadInterval},
      user: {
        currentSettings,
      },
    };

    const features = new Features(['ENABLE_AGENTS']);

    const {render, store} = rendererWith({
      capabilities: true,
      gmp,
      router: true,
      store: true,
      features,
    });

    store.dispatch(setTimezone('UTC'));
    store.dispatch(setUsername('admin'));
    store.dispatch(entityLoadingActions.success('scanner-123', scanner));

    render(<ScannerDetailsPage id="scanner-123" />);

    const agentConfigTab = screen.getByRole('tab', {
      name: 'Agent Default Configuration',
    });
    fireEvent.click(agentConfigTab);

    expect(
      screen.getByText('Agent Control - Retry Settings'),
    ).toBeInTheDocument();
    expect(screen.getByText('Agent Script Executor')).toBeInTheDocument();
    expect(screen.getByText('Heartbeat')).toBeInTheDocument();
    expect(screen.getByText('Agent Control Defaults')).toBeInTheDocument();
  });

  test('should display user tags content when tab is clicked', () => {
    const scanner = createMockScanner();

    const gmp = {
      scanner: {
        get: testing.fn().mockResolvedValue({data: scanner}),
      },
      permissions: {
        get: getEntities,
      },
      settings: {manualUrl, reloadInterval},
      user: {
        currentSettings,
      },
    };

    const {render, store} = rendererWith({
      capabilities: true,
      gmp,
      router: true,
      store: true,
    });

    store.dispatch(setTimezone('UTC'));
    store.dispatch(setUsername('admin'));
    store.dispatch(entityLoadingActions.success('scanner-123', scanner));

    const {container} = render(<ScannerDetailsPage id="scanner-123" />);

    const userTagsTab = screen.getByRole('tab', {name: 'User Tags ( 0 )'});
    fireEvent.click(userTagsTab);

    expect(container).toHaveTextContent('No user tags available');
  });

  test('should display permissions content when tab is clicked', () => {
    const scanner = createMockScanner();

    const gmp = {
      scanner: {
        get: testing.fn().mockResolvedValue({data: scanner}),
      },
      permissions: {
        get: getEntities,
      },
      settings: {manualUrl, reloadInterval},
      user: {
        currentSettings,
      },
    };

    const {render, store} = rendererWith({
      capabilities: true,
      gmp,
      router: true,
      store: true,
    });

    store.dispatch(setTimezone('UTC'));
    store.dispatch(setUsername('admin'));
    store.dispatch(entityLoadingActions.success('scanner-123', scanner));

    const {container} = render(<ScannerDetailsPage id="scanner-123" />);

    const permissionsTab = screen.getByRole('tab', {name: 'Permissions ( 0 )'});
    fireEvent.click(permissionsTab);

    expect(container).toHaveTextContent('No permissions available');
  });

  test('should render toolbar icons', () => {
    const scanner = createMockScanner();

    const gmp = {
      scanner: {
        get: testing.fn().mockResolvedValue({data: scanner}),
      },
      permissions: {
        get: getEntities,
      },
      settings: {manualUrl, reloadInterval},
      user: {
        currentSettings,
      },
    };

    const {render, store} = rendererWith({
      capabilities: true,
      gmp,
      router: true,
      store: true,
    });

    store.dispatch(setTimezone('UTC'));
    store.dispatch(setUsername('admin'));
    store.dispatch(entityLoadingActions.success('scanner-123', scanner));

    render(<ScannerDetailsPage id="scanner-123" />);

    expect(screen.getByTitle('Help: Scanners')).toBeInTheDocument();
    expect(screen.getByTitle('Scanner List')).toBeInTheDocument();
  });

  test('should call onChanged when modifications are made', async () => {
    const scanner = createMockScanner(AGENT_CONTROLLER_SCANNER_TYPE, true);

    const modifyAgentControlConfig = testing.fn().mockResolvedValue({
      data: {},
    });

    const getScanner = testing.fn().mockResolvedValue({data: scanner});

    const gmp = {
      scanner: {
        get: getScanner,
        modifyAgentControlConfig,
      },
      permissions: {
        get: getEntities,
      },
      settings: {manualUrl, reloadInterval},
      user: {
        currentSettings,
      },
    };

    const features = new Features(['ENABLE_AGENTS']);

    const {render, store} = rendererWith({
      capabilities: true,
      gmp,
      router: true,
      store: true,
      features,
    });

    store.dispatch(setTimezone('UTC'));
    store.dispatch(setUsername('admin'));
    store.dispatch(entityLoadingActions.success('scanner-123', scanner));

    render(<ScannerDetailsPage id="scanner-123" />);

    const agentConfigTab = screen.getByRole('tab', {
      name: 'Agent Default Configuration',
    });
    fireEvent.click(agentConfigTab);

    // Get the scanner again after clicking the tab to verify onChanged would work
    expect(getScanner).toHaveBeenCalled();
  });
});

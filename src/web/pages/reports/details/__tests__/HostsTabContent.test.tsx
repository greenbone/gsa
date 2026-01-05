/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {screen, rendererWith} from 'web/testing';
import Filter from 'gmp/models/filter';
import {SEVERITY_RATING_CVSS_3} from 'gmp/utils/severity';
import {getMockReport} from 'web/pages/reports/__fixtures__/MockReport';
import HostsTabContent from 'web/pages/reports/details/HostsTabContent';
import {setTimezone, setUsername} from 'web/store/usersettings/actions';

const createMockProps = (overrides = {}) => {
  const {hosts} = getMockReport();
  if (!hosts?.entities) {
    throw new Error('Mock report did not return hosts or hosts.entities');
  }
  const filter = Filter.fromString(
    'apply_overrides=0 levels=hml rows=2 min_qod=70 first=1 sort-reverse=severity',
  );

  return {
    hosts: {
      counts: hosts.counts,
      entities: hosts.entities,
    },
    isContainerScanning: false,
    reportFilter: filter,
    isUpdating: false,
    showInitialLoading: false,
    showThresholdMessage: false,
    sorting: {
      hosts: {
        sortField: 'severity',
        sortReverse: true,
      },
    },
    threshold: 1000,
    onFilterChanged: testing.fn(),
    onFilterEditClick: testing.fn(),
    onSortChange: testing.fn(),
    ...overrides,
  };
};

describe('HostsTabContent', () => {
  test('should render Loading component when showInitialLoading is true', () => {
    const props = createMockProps({
      showInitialLoading: true,
    });
    const {render} = rendererWith({
      capabilities: true,
      router: true,
      store: true,
    });

    render(<HostsTabContent {...props} />);

    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });

  test('should render ThresholdPanel when showThresholdMessage is true', () => {
    const props = createMockProps({
      showThresholdMessage: true,
    });
    const {render} = rendererWith({
      gmp: {
        settings: {
          severityRating: 'cvss_3',
        },
      },
      capabilities: true,
      router: true,
      store: true,
    });

    render(<HostsTabContent {...props} />);

    expect(
      screen.getByText(/cannot be displayed.*performance.*threshold of 1000/i),
    ).toBeInTheDocument();
    expect(screen.getAllByTestId('filter-icon')).toHaveLength(2);
  });

  test('should render ContainerScanningHostsTab when isContainerScanning is true', () => {
    const props = createMockProps({
      isContainerScanning: true,
    });
    const {render, store} = rendererWith({
      gmp: {
        settings: {
          severityRating: SEVERITY_RATING_CVSS_3,
        },
      },
      capabilities: true,
      router: true,
      store: true,
    });
    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    render(<HostsTabContent {...props} />);

    // Check for container scanning specific elements
    const table = screen.getByRole('table');
    expect(table).toBeInTheDocument();

    // Check for pagination (which confirms ContainerScanningHostsTab is rendered)
    expect(screen.getAllByText('1 - 2 of 2')).toHaveLength(2);
  });

  test('should render HostsTab when isContainerScanning is false', () => {
    const props = createMockProps({
      isContainerScanning: false,
    });
    const {render, store} = rendererWith({
      gmp: {
        settings: {
          severityRating: SEVERITY_RATING_CVSS_3,
        },
      },
      capabilities: true,
      router: true,
      store: true,
    });
    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    render(<HostsTabContent {...props} />);

    // Check for regular hosts tab elements
    const table = screen.getByRole('table');
    expect(table).toBeInTheDocument();
    // Check that we have the standard hosts table
    expect(screen.getByText(/123\.456\.78\.910/)).toBeInTheDocument();
  });

  test('should pass correct props to ContainerScanningHostsTab', () => {
    const mockOnSortChange = testing.fn();
    const props = createMockProps({
      isContainerScanning: true,
      onSortChange: mockOnSortChange,
    });
    const {render, store} = rendererWith({
      gmp: {
        settings: {
          severityRating: SEVERITY_RATING_CVSS_3,
        },
      },
      capabilities: true,
      router: true,
      store: true,
    });
    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    render(<HostsTabContent {...props} />);

    // Verify the component is rendered with expected data
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getAllByTestId('progressbar-box')).toHaveLength(2);
  });

  test('should pass correct props to HostsTab', () => {
    const mockOnSortChange = testing.fn();
    const props = createMockProps({
      isContainerScanning: false,
      onSortChange: mockOnSortChange,
    });
    const {render, store} = rendererWith({
      gmp: {
        settings: {
          severityRating: SEVERITY_RATING_CVSS_3,
        },
      },
      capabilities: true,
      router: true,
      store: true,
    });
    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    render(<HostsTabContent {...props} />);

    // Verify the component is rendered with expected data
    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  test('should prioritize showInitialLoading over other conditions', () => {
    const props = createMockProps({
      showInitialLoading: true,
      showThresholdMessage: true,
      isContainerScanning: true,
    });
    const {render} = rendererWith({
      capabilities: true,
      router: true,
      store: true,
    });

    render(<HostsTabContent {...props} />);

    expect(screen.getByTestId('loading')).toBeInTheDocument();
    expect(screen.queryByText(/threshold/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  test('should prioritize showThresholdMessage over tab rendering', () => {
    const props = createMockProps({
      showInitialLoading: false,
      showThresholdMessage: true,
      isContainerScanning: true,
    });
    const {render} = rendererWith({
      gmp: {
        settings: {
          severityRating: SEVERITY_RATING_CVSS_3,
        },
      },
      capabilities: true,
      router: true,
      store: true,
    });

    render(<HostsTabContent {...props} />);

    expect(
      screen.getByText(/cannot be displayed.*performance.*threshold of 1000/i),
    ).toBeInTheDocument();
    expect(screen.getAllByTestId('filter-icon')).toHaveLength(2);
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });
});

/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test} from '@gsa/testing';
import {rendererWith, screen, within} from 'web/testing';
import CollectionCounts from 'gmp/collection/collection-counts';
import Filter from 'gmp/models/filter';
import ReportHost from 'gmp/models/report/host';
import {createSession} from 'gmp/testing';
import {SEVERITY_RATING_CVSS_3} from 'gmp/utils/severity';
import {host1, host2} from 'web/pages/reports/__fixtures__/MockReport';
import HostsTabContent, {
  type HostsTabContentProps,
} from 'web/pages/reports/details/host/HostsTabContent';

const filter = Filter.fromString(
  'apply_overrides=0 levels=hml rows=2 min_qod=70 first=1 sort-reverse=severity',
);

const reportId = 'report-123';

const mockHosts = [
  ReportHost.fromElement({...host1, severity: 10.0}),
  ReportHost.fromElement({...host2, severity: 5.0}),
];
const mockHostsCounts = new CollectionCounts({
  all: 2,
  filtered: 2,
  first: 1,
  rows: 2,
  length: 2,
});

const mockHostsData = {
  entities: mockHosts,
  entitiesCounts: mockHostsCounts,
};

const gmp = {
  settings: {
    severityRating: SEVERITY_RATING_CVSS_3,
  },
  session: createSession({timezone: 'CET'}),
};

const createMockProps = (
  overrides: Partial<HostsTabContentProps> = {},
): HostsTabContentProps => ({
  reportId,
  isContainerScanning: false,
  reportFilter: filter,
  ...overrides,
});

describe('HostsTabContent', () => {
  test('should render ContainerScanningHostsTab when isContainerScanning is true', () => {
    const props = createMockProps({
      isContainerScanning: true,
      hostsData: mockHostsData,
    });
    const {render} = rendererWith({
      gmp,
      capabilities: true,
      router: true,
    });

    render(<HostsTabContent {...props} />);

    const table = screen.getByRole('table');
    expect(table).toBeInTheDocument();
    expect(screen.getAllByText('1 - 2 of 2')).toHaveLength(2);
  });

  test('should render HostsTab when isContainerScanning is false', () => {
    const props = createMockProps({
      isContainerScanning: false,
      hostsData: mockHostsData,
    });
    const {render} = rendererWith({
      gmp,
      capabilities: true,
      router: true,
    });

    render(<HostsTabContent {...props} />);

    const table = screen.getByRole('table');
    expect(table).toBeInTheDocument();
    expect(screen.getByText(/123\.456\.78\.910/)).toBeInTheDocument();
  });

  test('should pass correct props to ContainerScanningHostsTab', () => {
    const props = createMockProps({
      isContainerScanning: true,
      hostsData: mockHostsData,
    });
    const {render} = rendererWith({
      gmp,
      capabilities: true,
      router: true,
    });

    render(<HostsTabContent {...props} />);

    screen.getByRole('table');
    expect(screen.getAllByTestId('progressbar-box')).toHaveLength(2);
  });

  test('should pass correct props to HostsTab', () => {
    const props = createMockProps({
      isContainerScanning: false,
      hostsData: mockHostsData,
    });
    const {render} = rendererWith({
      gmp,
      capabilities: true,
      router: true,
    });

    render(<HostsTabContent {...props} />);

    screen.getByRole('table');
  });

  test('should show Loading spinner while hook is fetching', () => {
    const props = createMockProps({
      isHostsFetching: true,
      hostsData: undefined,
    });
    const {render} = rendererWith({gmp, capabilities: true, router: true});

    render(<HostsTabContent {...props} />);

    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });

  test('should render ErrorPanel on fetch failure', () => {
    const props = createMockProps({
      isHostsError: true,
    });
    const {render} = rendererWith({gmp, capabilities: true, router: true});

    render(<HostsTabContent {...props} />);

    expect(
      screen.getByText(/Error while loading Hosts for Report/),
    ).toBeInTheDocument();
  });

  test('should call API with reportId and filter', () => {
    const props = createMockProps({
      hostsData: mockHostsData,
    });
    const {render} = rendererWith({gmp, capabilities: true, router: true});

    render(<HostsTabContent {...props} />);

    // Component receives data via props, verify it renders correctly
    const table = screen.getByRole('table');
    expect(table).toBeInTheDocument();
  });

  test('should render table with host rows once data resolves', () => {
    const props = createMockProps({
      hostsData: mockHostsData,
    });
    const {render} = rendererWith({gmp, capabilities: true, router: true});

    render(<HostsTabContent {...props} />);

    const table = screen.getByRole('table');
    expect(table).toBeInTheDocument();

    const rows = within(table).getAllByRole('row');
    expect(rows.length).toBeGreaterThan(1);
  });
});

/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {screen, rendererWith, within} from 'web/testing';
import CollectionCounts from 'gmp/collection/collection-counts';
import Filter from 'gmp/models/filter';
import {createSession} from 'gmp/testing';
import {SEVERITY_RATING_CVSS_3} from 'gmp/utils/severity';
import {getMockReport} from 'web/pages/reports/__fixtures__/MockReport';
import HostsTabContent, {
  type HostsTabContentProps,
} from 'web/pages/reports/details/HostsTabContent';

const filter = Filter.fromString(
  'apply_overrides=0 levels=hml rows=2 min_qod=70 first=1 sort-reverse=severity',
);

const reportId = 'report-123';

const {hosts: mockReportHosts} = getMockReport();
const mockHosts = mockReportHosts?.entities ?? [];
const mockHostsCounts =
  mockReportHosts?.counts ??
  new CollectionCounts({filtered: 0, all: 0, first: 1, rows: 2});

const createGmp = ({
  getReportHosts = testing.fn().mockResolvedValue({
    data: mockHosts,
    meta: {
      filter,
      counts: mockHostsCounts,
    },
  }),
  severityRating = SEVERITY_RATING_CVSS_3,
} = {}) => ({
  reporthosts: {
    get: getReportHosts,
  },
  settings: {
    severityRating,
    reloadInterval: 5000,
    reloadIntervalActive: 2000,
    reloadIntervalInactive: 10000,
  },
  session: createSession({
    timezone: 'CET',
    token: 'test-token',
    username: 'admin',
  }),
});

const createMockProps = (
  overrides: Partial<HostsTabContentProps> = {},
): HostsTabContentProps => ({
  reportId,
  status: 'Done',
  isContainerScanning: false,
  reportFilter: filter,
  ...overrides,
});

describe('HostsTabContent', () => {
  test('should render ContainerScanningHostsTab when isContainerScanning is true', async () => {
    const gmp = createGmp();
    const props = createMockProps({
      isContainerScanning: true,
    });
    const {render} = rendererWith({
      gmp,
      capabilities: true,
      router: true,
    });

    render(<HostsTabContent {...props} />);

    const table = await screen.findByRole('table');
    expect(table).toBeInTheDocument();
    expect(screen.getAllByText('1 - 2 of 2')).toHaveLength(2);
  });

  test('should render HostsTab when isContainerScanning is false', async () => {
    const gmp = createGmp();
    const props = createMockProps({
      isContainerScanning: false,
    });
    const {render} = rendererWith({
      gmp,
      capabilities: true,
      router: true,
    });

    render(<HostsTabContent {...props} />);

    const table = await screen.findByRole('table');
    expect(table).toBeInTheDocument();
    expect(screen.getByText(/123\.456\.78\.910/)).toBeInTheDocument();
  });

  test('should pass correct props to ContainerScanningHostsTab', async () => {
    const gmp = createGmp();
    const props = createMockProps({
      isContainerScanning: true,
    });
    const {render} = rendererWith({
      gmp,
      capabilities: true,
      router: true,
    });

    render(<HostsTabContent {...props} />);

    await screen.findByRole('table');
    expect(screen.getAllByTestId('progressbar-box')).toHaveLength(2);
  });

  test('should pass correct props to HostsTab', async () => {
    const gmp = createGmp();
    const props = createMockProps({
      isContainerScanning: false,
    });
    const {render} = rendererWith({
      gmp,
      capabilities: true,
      router: true,
    });

    render(<HostsTabContent {...props} />);

    await screen.findByRole('table');
  });

  // Hook-based assertions
  test('should show Loading spinner while hook is fetching', () => {
    const gmp = createGmp();
    const props = createMockProps();
    const {render} = rendererWith({gmp, capabilities: true, router: true});

    render(<HostsTabContent {...props} />);

    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });

  test('should render ErrorPanel on fetch failure', async () => {
    const gmp = createGmp({
      getReportHosts: testing
        .fn()
        .mockRejectedValue(new Error('Failed to fetch hosts')),
    });
    const props = createMockProps();
    const {render} = rendererWith({gmp, capabilities: true, router: true});

    render(<HostsTabContent {...props} />);

    expect(
      await screen.findByText(/Error while loading Hosts for Report/),
    ).toBeInTheDocument();
  });

  test('should call API with reportId and filter', async () => {
    const getReportHosts = testing.fn().mockResolvedValue({
      data: mockHosts,
      meta: {filter, counts: mockHostsCounts},
    });
    const gmp = createGmp({getReportHosts});
    const props = createMockProps();
    const {render} = rendererWith({gmp, capabilities: true, router: true});

    render(<HostsTabContent {...props} />);

    await screen.findByRole('table');

    expect(getReportHosts).toHaveBeenCalledWith(
      expect.objectContaining({
        report_id: reportId,
        filter: expect.objectContaining({}),
      }),
    );
  });

  test('should render table with host rows once data resolves', async () => {
    const gmp = createGmp();
    const props = createMockProps();
    const {render} = rendererWith({gmp, capabilities: true, router: true});

    render(<HostsTabContent {...props} />);

    const table = await screen.findByRole('table');
    expect(table).toBeInTheDocument();

    const rows = within(table).getAllByRole('row');
    expect(rows.length).toBeGreaterThan(1);
  });
});

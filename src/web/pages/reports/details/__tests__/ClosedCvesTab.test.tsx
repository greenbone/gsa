/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {rendererWith, screen, within} from 'web/testing';
import CollectionCounts from 'gmp/collection/collection-counts';
import Filter from 'gmp/models/filter';
import {createSession} from 'gmp/testing';
import {getMockReport} from 'web/pages/reports/__fixtures__/MockReport';
import ClosedCvesTab from 'web/pages/reports/details/ClosedCvesTab';

const filter = Filter.fromString(
  'apply_overrides=0 levels=hml rows=2 min_qod=70 first=1 sort-reverse=severity',
);

const {closedCves: mockReportClosedCves} = getMockReport();
const mockClosedCves = mockReportClosedCves?.entities ?? [];
const mockClosedCvesCounts =
  mockReportClosedCves?.counts ??
  new CollectionCounts({filtered: 0, all: 0, first: 1, rows: 10});

const createGmp = ({
  getReportClosedCves = testing.fn().mockResolvedValue({
    data: mockClosedCves,
    meta: {
      filter,
      counts: mockClosedCvesCounts,
    },
  }),
} = {}) => ({
  reportclosedcves: {
    get: getReportClosedCves,
  },
  settings: {
    severityRating: 'CVSSv3',
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

const reportId = 'report-123';

describe('Report Closed CVEs Tab tests', () => {
  test('should render loading state initially', () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp, router: true, capabilities: true});

    render(<ClosedCvesTab filter={filter} reportId={reportId} status="Done" />);

    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });

  test('should render Report Closed CVEs Tab', async () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp, router: true, capabilities: true});
    render(<ClosedCvesTab filter={filter} reportId={reportId} status="Done" />);

    // Verify headers
    const table = await screen.findByRole('table');
    const headers = within(table).getAllByRole('columnheader');
    expect(headers[0]).toHaveTextContent('CVE');
    expect(headers[1]).toHaveTextContent('Host');
    expect(headers[2]).toHaveTextContent('NVT');
    expect(headers[3]).toHaveTextContent('Severity');

    // Get severity bars and verify row data (sorted ascending with sort-reverse filter)
    const bars = screen.getAllByTestId('progressbar-box');
    expect(bars[0]).toHaveAttribute('title', 'Medium');
    expect(bars[0]).toHaveTextContent('5.0 (Medium)');
    expect(bars[1]).toHaveAttribute('title', 'Critical');
    expect(bars[1]).toHaveTextContent('10.0 (Critical)');

    // Verify CVE links
    const cveLink1 = screen.getByText('CVE-2000-1234');
    expect(cveLink1.closest('a')).toHaveAttribute('href', '/cve/CVE-2000-1234');

    const cveLink2 = screen.getByText('CVE-2000-5678');
    expect(cveLink2.closest('a')).toHaveAttribute('href', '/cve/CVE-2000-5678');

    // Verify host links (host1 has asset id=123, host2 has no asset)
    const hostLink1 = screen.getByText('123.456.78.910');
    expect(hostLink1.closest('a')).toHaveAttribute('href', '/host/123');

    const hostLink2 = screen.getByText('109.876.54.321');
    expect(hostLink2.closest('a')).toHaveAttribute(
      'href',
      '/hosts?filter=name%3D109.876.54.321',
    );

    // Verify NVT links
    const nvtLink1 = screen.getByText('This is a description');
    expect(nvtLink1.closest('a')).toHaveAttribute('href', '/nvt/201');

    const nvtLink2 = screen.getByText('This is another description');
    expect(nvtLink2.closest('a')).toHaveAttribute('href', '/nvt/202');
  });

  test('should render empty state when no closed CVEs', async () => {
    const gmp = createGmp({
      getReportClosedCves: testing.fn().mockResolvedValue({
        data: [],
        meta: {
          filter,
          counts: new CollectionCounts({
            filtered: 0,
            all: 0,
            first: 1,
            rows: 10,
          }),
        },
      }),
    });
    const {render} = rendererWith({gmp, router: true, capabilities: true});

    render(<ClosedCvesTab filter={filter} reportId={reportId} status="Done" />);

    expect(
      await screen.findByText('No Closed CVEs available'),
    ).toBeInTheDocument();
  });

  test('should render error panel on fetch failure', async () => {
    const gmp = createGmp({
      getReportClosedCves: testing
        .fn()
        .mockRejectedValue(new Error('Failed to fetch closed CVEs')),
    });
    const {render} = rendererWith({gmp, router: true, capabilities: true});

    render(<ClosedCvesTab filter={filter} reportId={reportId} status="Done" />);

    expect(
      await screen.findByText(/Error while loading Closed CVEs for Report/),
    ).toBeInTheDocument();
  });
});

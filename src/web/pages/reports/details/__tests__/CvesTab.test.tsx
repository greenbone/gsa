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
import CvesTab from 'web/pages/reports/details/CvesTab';

const filter = Filter.fromString(
  'apply_overrides=0 levels=hml rows=2 min_qod=70 first=1 sort-reverse=severity',
);

const {cves: mockReportCves} = getMockReport();
const mockCves = mockReportCves?.entities ?? [];
const mockCvesCounts =
  mockReportCves?.counts ??
  new CollectionCounts({filtered: 0, all: 0, first: 1, rows: 10});

const createGmp = ({
  getReportCves = testing.fn().mockResolvedValue({
    data: mockCves,
    meta: {
      filter,
      counts: mockCvesCounts,
    },
  }),
} = {}) => ({
  reportcves: {
    get: getReportCves,
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

describe('Report CVEs Tab tests', () => {
  test('should render loading state initially', () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp, router: true, capabilities: true});

    render(<CvesTab filter={filter} reportId={reportId} status="Done" />);

    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });

  test('should render Report CVEs Tab', async () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp, router: true, capabilities: true});
    render(<CvesTab filter={filter} reportId={reportId} status="Done" />);

    // Verify headers
    const table = await screen.findByRole('table');
    const headers = within(table).getAllByRole('columnheader');
    expect(headers[0]).toHaveTextContent('CVE');
    expect(headers[1]).toHaveTextContent('Host');
    expect(headers[2]).toHaveTextContent('NVT');
    expect(headers[3]).toHaveTextContent('Severity');

    // Get severity bars and verify row data (sorted ascending with sort-reverse filter, rows=2 → 2 rows displayed)
    const bars = screen.getAllByTestId('progressbar-box');
    expect(bars[0]).toHaveAttribute('title', 'Medium');
    expect(bars[0]).toHaveTextContent('5.0 (Medium)');
    expect(bars[1]).toHaveAttribute('title', 'Medium');
    expect(bars[1]).toHaveTextContent('5.0 (Medium)');

    // Verify CVE links
    const cveLink1 = screen.getByText('CVE-2019-1234');
    expect(cveLink1.closest('a')).toHaveAttribute('href', '/cve/CVE-2019-1234');

    // Verify NVT links
    const nvtLink1 = screen.getByText('nvt1');
    expect(nvtLink1.closest('a')).toHaveAttribute('href', '/nvt/201');
  });

  test('should render empty state when no CVEs', async () => {
    const gmp = createGmp({
      getReportCves: testing.fn().mockResolvedValue({
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

    render(<CvesTab filter={filter} reportId={reportId} status="Done" />);

    expect(await screen.findByText('No CVEs available')).toBeInTheDocument();
  });

  test('should render error panel on fetch failure', async () => {
    const gmp = createGmp({
      getReportCves: testing
        .fn()
        .mockRejectedValue(new Error('Failed to fetch CVEs')),
    });
    const {render} = rendererWith({gmp, router: true, capabilities: true});

    render(<CvesTab filter={filter} reportId={reportId} status="Done" />);

    expect(
      await screen.findByText(/Error while loading CVEs for Report/),
    ).toBeInTheDocument();
  });
});

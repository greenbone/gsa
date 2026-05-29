/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test} from '@gsa/testing';
import {rendererWith, screen, within} from 'web/testing';
import CollectionCounts from 'gmp/collection/collection-counts';
import Filter from 'gmp/models/filter';
import CvesTab from 'web/pages/reports/details/cve/CvesTab';

const filter = Filter.fromString(
  'apply_overrides=0 levels=hml rows=2 min_qod=70 first=1 sort-reverse=severity',
);

const mockCves = [
  {
    id: 'CVE-2019-1234',
    cveId: 'CVE-2019-1234',
    host: {
      id: '123',
      ip: '123.456.78.910',
    },
    source: {
      name: '201',
      description: 'nvt1',
    },
    severity: 5.0,
  },
  {
    id: 'CVE-2019-5678',
    cveId: 'CVE-2019-5678',
    host: {
      ip: '109.876.54.321',
    },
    source: {
      name: '202',
      description: 'nvt2',
    },
    severity: 5.0,
  },
];
const mockCvesCounts = new CollectionCounts({
  filtered: 2,
  all: 2,
  first: 1,
  rows: 10,
});

const reportId = 'report-123';

const mockCvesData = {
  entities: mockCves,
  entitiesCounts: mockCvesCounts,
};

const gmp = {
  settings: {
    severityRating: 'CVSSv3',
  },
};

describe('Report CVEs Tab tests', () => {
  test('should render loading state initially', () => {
    const {render} = rendererWith({gmp, capabilities: true});

    render(
      <CvesTab filter={filter} isCvesFetching={true} reportId={reportId} />,
    );

    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });

  test('should render Report CVEs Tab', async () => {
    const {render} = rendererWith({gmp, capabilities: true});
    render(
      <CvesTab cvesData={mockCvesData} filter={filter} reportId={reportId} />,
    );

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
    const {render} = rendererWith({gmp, capabilities: true});

    render(
      <CvesTab
        cvesData={{
          entities: [],
          entitiesCounts: new CollectionCounts({
            filtered: 0,
            all: 0,
            first: 1,
            rows: 10,
          }),
        }}
        filter={filter}
        reportId={reportId}
      />,
    );

    expect(await screen.findByText('No CVEs available')).toBeInTheDocument();
  });

  test('should render error panel when CVEs are in error state', async () => {
    const {render} = rendererWith({gmp, capabilities: true});

    render(<CvesTab filter={filter} isCvesError={true} reportId={reportId} />);

    expect(
      await screen.findByText(/Error while loading CVEs for Report/),
    ).toBeInTheDocument();
  });
});

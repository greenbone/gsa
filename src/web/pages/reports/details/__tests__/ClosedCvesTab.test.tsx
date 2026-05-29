/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test} from '@gsa/testing';
import {rendererWith, screen, within} from 'web/testing';
import CollectionCounts from 'gmp/collection/collection-counts';
import Filter from 'gmp/models/filter';
import ClosedCvesTab from 'web/pages/reports/details/cve/ClosedCvesTab';

const filter = Filter.fromString(
  'apply_overrides=0 levels=hml rows=2 min_qod=70 first=1 sort-reverse=severity',
);

const mockClosedCves = [
  {
    id: 'CVE-2000-1234',
    cveId: 'CVE-2000-1234',
    host: {
      id: '123',
      ip: '123.456.78.910',
    },
    source: {
      name: '201',
      description: 'This is a description',
    },
    severity: 5.0,
  },
  {
    id: 'CVE-2000-5678',
    cveId: 'CVE-2000-5678',
    host: {
      ip: '109.876.54.321',
    },
    source: {
      name: '202',
      description: 'This is another description',
    },
    severity: 10.0,
  },
];
const mockClosedCvesCounts = new CollectionCounts({
  filtered: 2,
  all: 2,
  first: 1,
  rows: 10,
});

const reportId = 'report-123';

const mockClosedCvesData = {
  entities: mockClosedCves,
  entitiesCounts: mockClosedCvesCounts,
};

const gmp = {
  settings: {
    severityRating: 'CVSSv3',
  },
};

describe('Report Closed CVEs Tab tests', () => {
  test('should render loading state initially', () => {
    const {render} = rendererWith({gmp, router: true, capabilities: true});

    render(
      <ClosedCvesTab
        filter={filter}
        isClosedCvesFetching={true}
        reportId={reportId}
      />,
    );

    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });

  test('should render Report Closed CVEs Tab', async () => {
    const {render} = rendererWith({gmp, router: true, capabilities: true});
    render(
      <ClosedCvesTab
        closedCvesData={mockClosedCvesData}
        filter={filter}
        reportId={reportId}
      />,
    );

    // Verify headers
    const table = await screen.findByRole('table');
    const headers = within(table).getAllByRole('columnheader');
    expect(headers[0]).toHaveTextContent('CVE');
    expect(headers[1]).toHaveTextContent('Host');
    expect(headers[2]).toHaveTextContent('NVT');
    expect(headers[3]).toHaveTextContent('Severity');

    // Get severity bars and verify row data (sorted ascending with sort-reverse filter)
    const bars = screen.getAllByTestId('progressbar-box');
    const barTitles = bars.map(bar => bar.getAttribute('title'));
    const barTexts = bars.map(bar => bar.textContent ?? '');
    expect(barTitles).toContain('Medium');
    expect(barTitles).toContain('Critical');
    expect(barTexts).toContain('5.0 (Medium)');
    expect(barTexts).toContain('10.0 (Critical)');

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
    const {render} = rendererWith({gmp, router: true, capabilities: true});

    render(
      <ClosedCvesTab
        closedCvesData={{
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

    expect(
      await screen.findByText('No Closed CVEs available'),
    ).toBeInTheDocument();
  });

  test('should render error panel when closed CVEs are in error state', async () => {
    const {render} = rendererWith({gmp, router: true, capabilities: true});

    render(
      <ClosedCvesTab
        filter={filter}
        isClosedCvesError={true}
        reportId={reportId}
      />,
    );

    expect(
      await screen.findByText(/Error while loading Closed CVEs for Report/),
    ).toBeInTheDocument();
  });
});

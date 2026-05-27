/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test} from '@gsa/testing';
import {rendererWith, screen, within} from 'web/testing';
import CollectionCounts from 'gmp/collection/collection-counts';
import Filter from 'gmp/models/filter';
import type {ReportClosedCve} from 'gmp/models/report/parser';
import {SEVERITY_RATING_CVSS_3} from 'gmp/utils/severity';
import ClosedCvesTable from 'web/pages/reports/details/cve/ClosedCvesTable';

const filter = Filter.fromString('first=1 rows=10');

const createGmp = () => ({
  settings: {
    severityRating: SEVERITY_RATING_CVSS_3,
  },
});

const createMockClosedCve = (
  overrides: Partial<ReportClosedCve> = {},
): ReportClosedCve => ({
  id: 'CVE-2000-1234-123.456.78.910-201',
  cveId: 'CVE-2000-1234',
  host: {ip: '123.456.78.910'},
  source: {name: '201', description: 'This is a description'},
  severity: 10.0,
  ...overrides,
});

const createCounts = (count: number) =>
  new CollectionCounts({
    filtered: count,
    all: count,
    first: 1,
    rows: 10,
  });

describe('ClosedCvesTable', () => {
  test('should render all column headers', () => {
    const entities = [createMockClosedCve()];
    const {render} = rendererWith({
      gmp: createGmp(),
      capabilities: true,
      router: true,
    });

    render(
      <ClosedCvesTable
        // @ts-expect-error entities are ReportClosedCve[], not Model[]
        entities={entities}
        entitiesCounts={createCounts(1)}
        filter={filter}
      />,
    );

    const table = screen.getByRole('table');
    const headers = within(table).getAllByRole('columnheader');

    expect(headers.some(th => /CVE/i.exec(th.textContent))).toBe(true);
    expect(headers.some(th => /Host/i.exec(th.textContent))).toBe(true);
    expect(headers.some(th => /NVT/i.exec(th.textContent))).toBe(true);
    expect(headers.some(th => /Severity/i.exec(th.textContent))).toBe(true);
  });

  test('should render CVE as a link pointing to the CVE detail page', () => {
    const entities = [createMockClosedCve({cveId: 'CVE-2000-1234'})];
    const {render} = rendererWith({
      gmp: createGmp(),
      capabilities: true,
      router: true,
    });

    render(
      <ClosedCvesTable
        // @ts-expect-error entities are ReportClosedCve[], not Model[]
        entities={entities}
        entitiesCounts={createCounts(1)}
        filter={filter}
      />,
    );

    const cveLink = screen.getByText('CVE-2000-1234');
    expect(cveLink.closest('a')).toHaveAttribute('href', '/cve/CVE-2000-1234');
  });

  test('should render host without id as a filter link to the hosts page', () => {
    const entities = [createMockClosedCve({host: {ip: '123.456.78.910'}})];
    const {render} = rendererWith({
      gmp: createGmp(),
      capabilities: true,
      router: true,
    });

    render(
      <ClosedCvesTable
        // @ts-expect-error entities are ReportClosedCve[], not Model[]
        entities={entities}
        entitiesCounts={createCounts(1)}
        filter={filter}
      />,
    );

    const hostLink = screen.getByText('123.456.78.910');
    expect(hostLink.closest('a')).toHaveAttribute(
      'href',
      '/hosts?filter=name%3D123.456.78.910',
    );
  });

  test('should render host with id as a DetailsLink to the host detail page', () => {
    const entities = [
      createMockClosedCve({host: {ip: '123.456.78.910', id: 'host-123'}}),
    ];
    const {render} = rendererWith({
      gmp: createGmp(),
      capabilities: true,
      router: true,
    });

    render(
      <ClosedCvesTable
        // @ts-expect-error entities are ReportClosedCve[], not Model[]
        entities={entities}
        entitiesCounts={createCounts(1)}
        filter={filter}
      />,
    );

    const hostLink = screen.getByText('123.456.78.910');
    expect(hostLink.closest('a')).toHaveAttribute('href', '/host/host-123');
  });

  test('should render NVT as a DetailsLink using the OID and showing the description', () => {
    const entities = [
      createMockClosedCve({
        source: {name: '201', description: 'This is a description'},
      }),
    ];
    const {render} = rendererWith({
      gmp: createGmp(),
      capabilities: true,
      router: true,
    });

    render(
      <ClosedCvesTable
        // @ts-expect-error entities are ReportClosedCve[], not Model[]
        entities={entities}
        entitiesCounts={createCounts(1)}
        filter={filter}
      />,
    );

    const nvtLink = screen.getByText('This is a description');
    expect(nvtLink.closest('a')).toHaveAttribute('href', '/nvt/201');
  });

  test('should render a severity bar for the CVE severity', () => {
    const entities = [createMockClosedCve({severity: 10.0})];
    const {render} = rendererWith({
      gmp: createGmp(),
      capabilities: true,
      router: true,
    });

    render(
      <ClosedCvesTable
        // @ts-expect-error entities are ReportClosedCve[], not Model[]
        entities={entities}
        entitiesCounts={createCounts(1)}
        filter={filter}
      />,
    );

    const bar = screen.getByTestId('progressbar-box');
    expect(bar).toHaveAttribute('title', 'Critical');
    expect(bar).toHaveTextContent('10.0 (Critical)');
  });

  test('should render multiple rows correctly', () => {
    const entities = [
      createMockClosedCve({
        id: 'CVE-2000-1234-123.456.78.910-201',
        cveId: 'CVE-2000-1234',
        host: {ip: '123.456.78.910', id: 'host-123'},
        source: {name: '201', description: 'This is a description'},
        severity: 10.0,
      }),
      createMockClosedCve({
        id: 'CVE-2000-5678-109.876.54.321-202',
        cveId: 'CVE-2000-5678',
        host: {ip: '109.876.54.321'},
        source: {name: '202', description: 'This is another description'},
        severity: 5.0,
      }),
    ];
    const {render} = rendererWith({
      gmp: createGmp(),
      capabilities: true,
      router: true,
    });

    render(
      <ClosedCvesTable
        // @ts-expect-error entities are ReportClosedCve[], not Model[]
        entities={entities}
        entitiesCounts={createCounts(2)}
        filter={filter}
      />,
    );

    screen.getByText('CVE-2000-1234');
    screen.getByText('CVE-2000-5678');
    screen.getByText('123.456.78.910');
    screen.getByText('109.876.54.321');
    screen.getByText('This is a description');
    screen.getByText('This is another description');
  });

  test('should render empty state when no closed CVEs are available', () => {
    const {render} = rendererWith({
      gmp: createGmp(),
      capabilities: true,
      router: true,
    });

    render(
      <ClosedCvesTable
        entities={[]}
        entitiesCounts={createCounts(0)}
        filter={filter}
      />,
    );

    screen.getByText('No Closed CVEs available');
  });
});

/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test} from '@gsa/testing';
import {rendererWith, screen, within} from 'web/testing';
import CollectionCounts from 'gmp/collection/collection-counts';
import Filter from 'gmp/models/filter';
import type {ReportActiveCve} from 'gmp/models/report/parser';
import {SEVERITY_RATING_CVSS_3} from 'gmp/utils/severity';
import CvesTable from 'web/pages/reports/details/cve/CvesTable';

const filter = Filter.fromString('first=1 rows=10');

const createGmp = () => ({
  settings: {
    severityRating: SEVERITY_RATING_CVSS_3,
  },
});

const createMockCve = (
  overrides: Partial<ReportActiveCve> = {},
): ReportActiveCve => ({
  id: 'CVE-2019-1234-123.456.78.910-201',
  cveId: 'CVE-2019-1234',
  host: {ip: '123.456.78.910'},
  source: {name: '201', description: 'nvt1'},
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

describe('CvesTable', () => {
  test('should render all column headers', () => {
    const entities = [createMockCve()];
    const {render} = rendererWith({
      gmp: createGmp(),
      capabilities: true,
      router: true,
    });

    render(
      <CvesTable
        // @ts-expect-error entities are ReportActiveCve[], not Model[]
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
    const entities = [createMockCve({cveId: 'CVE-2019-1234'})];
    const {render} = rendererWith({
      gmp: createGmp(),
      capabilities: true,
      router: true,
    });

    render(
      <CvesTable
        // @ts-expect-error entities are ReportActiveCve[], not Model[]
        entities={entities}
        entitiesCounts={createCounts(1)}
        filter={filter}
      />,
    );

    const cveLink = screen.getByText('CVE-2019-1234');
    expect(cveLink.closest('a')).toHaveAttribute('href', '/cve/CVE-2019-1234');
  });

  test('should render host without id as a filter link to the hosts page', () => {
    const entities = [createMockCve({host: {ip: '123.456.78.910'}})];
    const {render} = rendererWith({
      gmp: createGmp(),
      capabilities: true,
      router: true,
    });

    render(
      <CvesTable
        // @ts-expect-error entities are ReportActiveCve[], not Model[]
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
      createMockCve({host: {ip: '123.456.78.910', id: 'host-42'}}),
    ];
    const {render} = rendererWith({
      gmp: createGmp(),
      capabilities: true,
      router: true,
    });

    render(
      <CvesTable
        // @ts-expect-error entities are ReportActiveCve[], not Model[]
        entities={entities}
        entitiesCounts={createCounts(1)}
        filter={filter}
      />,
    );

    const hostLink = screen.getByText('123.456.78.910');
    expect(hostLink.closest('a')).toHaveAttribute('href', '/host/host-42');
  });

  test('should render NVT as a DetailsLink using the OID and showing the description', () => {
    const entities = [
      createMockCve({source: {name: '201', description: 'nvt1'}}),
    ];
    const {render} = rendererWith({
      gmp: createGmp(),
      capabilities: true,
      router: true,
    });

    render(
      <CvesTable
        // @ts-expect-error entities are ReportActiveCve[], not Model[]
        entities={entities}
        entitiesCounts={createCounts(1)}
        filter={filter}
      />,
    );

    const nvtLink = screen.getByText('nvt1');
    expect(nvtLink.closest('a')).toHaveAttribute('href', '/nvt/201');
  });

  test('should render a severity bar for the CVE severity', () => {
    const entities = [createMockCve({severity: 10.0})];
    const {render} = rendererWith({
      gmp: createGmp(),
      capabilities: true,
      router: true,
    });

    render(
      <CvesTable
        // @ts-expect-error entities are ReportActiveCve[], not Model[]
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
      createMockCve({
        id: 'CVE-2019-1234-123.456.78.910-201',
        cveId: 'CVE-2019-1234',
        host: {ip: '123.456.78.910'},
        source: {name: '201', description: 'nvt1'},
        severity: 10.0,
      }),
      createMockCve({
        id: 'CVE-2019-5678-109.876.54.321-202',
        cveId: 'CVE-2019-5678',
        host: {ip: '109.876.54.321'},
        source: {name: '202', description: 'nvt2'},
        severity: 5.0,
      }),
    ];
    const {render} = rendererWith({
      gmp: createGmp(),
      capabilities: true,
      router: true,
    });

    render(
      <CvesTable
        // @ts-expect-error entities are ReportActiveCve[], not Model[]
        entities={entities}
        entitiesCounts={createCounts(2)}
        filter={filter}
      />,
    );

    screen.getByText('CVE-2019-1234');
    screen.getByText('CVE-2019-5678');
    screen.getByText('123.456.78.910');
    screen.getByText('109.876.54.321');
    screen.getByText('nvt1');
    screen.getByText('nvt2');
  });

  test('should render empty state when no CVEs are available', () => {
    const {render} = rendererWith({
      gmp: createGmp(),
      capabilities: true,
      router: true,
    });

    render(
      <CvesTable
        entities={[]}
        entitiesCounts={createCounts(0)}
        filter={filter}
      />,
    );

    screen.getByText('No CVEs available');
  });
});

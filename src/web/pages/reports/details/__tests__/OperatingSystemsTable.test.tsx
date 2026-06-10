/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test, testing} from '@gsa/testing';
import {rendererWith, screen, userEvent, within} from 'web/testing';
import CollectionCounts from 'gmp/collection/collection-counts';
import Filter from 'gmp/models/filter';
import {SEVERITY_RATING_CVSS_3} from 'gmp/utils/severity';
import {getMockAuditReport} from 'web/pages/reports/__fixtures__/MockAuditReport';
import {getMockReport} from 'web/pages/reports/__fixtures__/MockReport';
import OperatingSystemsTable from 'web/pages/reports/details/operating-system/OperatingSystemsTable';

const filter = Filter.fromString('first=1 rows=10');

const createGmp = () => ({
  session: {timezone: 'CET'},

  settings: {
    severityRating: SEVERITY_RATING_CVSS_3,
  },
});

describe('OperatingSystemsTable', () => {
  test('should render table with all columns', () => {
    const {operatingsystems} = getMockReport();

    const {render} = rendererWith({
      gmp: createGmp(),
    });

    render(
      <OperatingSystemsTable
        // @ts-expect-error entities are ReportOperatingSystem[], not Model[]
        entities={operatingsystems?.entities ?? []}
        entitiesCounts={operatingsystems?.counts}
        filter={filter}
      />,
    );

    const table = screen.getByRole('table');

    const columnHeaders = within(table).getAllByRole('columnheader');

    expect(
      columnHeaders.some(th => /Operating System/i.exec(th.textContent)),
    ).toBe(true);

    expect(columnHeaders.some(th => /CPE/i.exec(th.textContent))).toBe(true);

    expect(columnHeaders.some(th => /Hosts/i.exec(th.textContent))).toBe(true);
  });

  test('should render operating system data correctly', () => {
    const {operatingsystems} = getMockReport();

    const {render} = rendererWith({
      gmp: createGmp(),
    });

    render(
      <OperatingSystemsTable
        // @ts-expect-error entities are ReportOperatingSystem[], not Model[]
        entities={operatingsystems?.entities ?? []}
        entitiesCounts={operatingsystems?.counts}
        filter={filter}
      />,
    );

    // Should render OS name and CPE

    screen.getByText('Foo OS');

    screen.getByText('cpe:/foo/bar');
  });

  test('should render operating system as link when CPE is defined', () => {
    const {operatingsystems} = getMockReport();

    const {render} = rendererWith({
      gmp: createGmp(),
    });

    render(
      <OperatingSystemsTable
        // @ts-expect-error entities are ReportOperatingSystem[], not Model[]
        entities={operatingsystems?.entities ?? []}
        entitiesCounts={operatingsystems?.counts}
        filter={filter}
      />,
    );

    const osLink = screen.getByText('Foo OS');

    expect(osLink.closest('a')).toHaveAttribute(
      'href',

      '/operatingsystems?filter=name%3Dcpe%3A%2Ffoo%2Fbar',
    );
  });

  test('should render CPE as link', () => {
    const {operatingsystems} = getMockReport();

    const {render} = rendererWith({
      gmp: createGmp(),
    });

    render(
      <OperatingSystemsTable
        // @ts-expect-error entities are ReportOperatingSystem[], not Model[]
        entities={operatingsystems?.entities ?? []}
        entitiesCounts={operatingsystems?.counts}
        filter={filter}
      />,
    );

    const cpeLink = screen.getByText('cpe:/foo/bar');

    expect(cpeLink.closest('a')).toHaveAttribute(
      'href',

      '/operatingsystems?filter=name%3Dcpe%3A%2Ffoo%2Fbar',
    );
  });

  test('should render empty state when no operating systems', () => {
    const counts = new CollectionCounts({
      filtered: 0,

      all: 0,

      first: 1,

      rows: 10,
    });

    const {render} = rendererWith({
      gmp: createGmp(),
    });

    render(
      <OperatingSystemsTable
        entities={[]}
        entitiesCounts={counts}
        filter={filter}
      />,
    );

    screen.getByText('No Operating Systems available');
  });

  test('should render audit report with compliance column', () => {
    const {operatingsystems} = getMockAuditReport();

    const auditFilter = Filter.fromString('first=1 rows=10');

    const {render} = rendererWith({
      gmp: createGmp(),
    });

    render(
      <OperatingSystemsTable
        audit={true}
        // @ts-expect-error entities are ReportOperatingSystem[], not Model[]
        entities={operatingsystems?.entities ?? []}
        entitiesCounts={operatingsystems?.counts}
        filter={auditFilter}
      />,
    );

    const table = screen.getByRole('table');

    const columnHeaders = within(table).getAllByRole('columnheader');

    expect(columnHeaders).toHaveLength(4);

    expect(
      columnHeaders.some(th => /Operating System/i.exec(th.textContent)),
    ).toBe(true);

    expect(columnHeaders.some(th => /CPE/i.exec(th.textContent))).toBe(true);

    expect(columnHeaders.some(th => /Hosts/i.exec(th.textContent))).toBe(true);

    expect(columnHeaders.some(th => /Compliant/i.exec(th.textContent))).toBe(
      true,
    );
  });

  test('should render compliance bar instead of severity bar for audit reports', () => {
    const {operatingsystems} = getMockAuditReport();

    const auditFilter = Filter.fromString('first=1 rows=10');

    const {render} = rendererWith({
      gmp: createGmp(),
    });

    render(
      <OperatingSystemsTable
        audit={true}
        // @ts-expect-error entities are ReportOperatingSystem[], not Model[]
        entities={operatingsystems?.entities ?? []}
        entitiesCounts={operatingsystems?.counts}
        filter={auditFilter}
      />,
    );

    // Should render compliance bars, not severity bars

    screen.getByText('No');

    screen.getByText('Incomplete');
  });

  test('should handle sorting by operating system column', async () => {
    const {operatingsystems} = getMockReport();

    const onSortChange = testing.fn();

    const {render} = rendererWith({
      gmp: createGmp(),
    });

    render(
      <OperatingSystemsTable
        // @ts-expect-error entities are ReportOperatingSystem[], not Model[]
        entities={operatingsystems?.entities ?? []}
        entitiesCounts={operatingsystems?.counts}
        filter={filter}
        onSortChange={onSortChange}
      />,
    );

    const osHeader = await screen.findByText('Operating System');

    await userEvent.click(osHeader);

    expect(onSortChange).toHaveBeenCalledWith('name');
  });

  test('should handle sorting by CPE column', async () => {
    const {operatingsystems} = getMockReport();

    const onSortChange = testing.fn();

    const {render} = rendererWith({
      gmp: createGmp(),
    });

    render(
      <OperatingSystemsTable
        // @ts-expect-error entities are ReportOperatingSystem[], not Model[]
        entities={operatingsystems?.entities ?? []}
        entitiesCounts={operatingsystems?.counts}
        filter={filter}
        onSortChange={onSortChange}
      />,
    );

    const cpeHeader = await screen.findByText('CPE');

    await userEvent.click(cpeHeader);

    expect(onSortChange).toHaveBeenCalledWith('cpe');
  });

  test('should handle sorting by hosts column', async () => {
    const {operatingsystems} = getMockReport();

    const onSortChange = testing.fn();

    const {render} = rendererWith({
      gmp: createGmp(),
    });

    render(
      <OperatingSystemsTable
        // @ts-expect-error entities are ReportOperatingSystem[], not Model[]
        entities={operatingsystems?.entities ?? []}
        entitiesCounts={operatingsystems?.counts}
        filter={filter}
        onSortChange={onSortChange}
      />,
    );

    const hostsHeader = await screen.findByText('Hosts');

    await userEvent.click(hostsHeader);

    expect(onSortChange).toHaveBeenCalledWith('hosts');
  });

  test('should not render severity column for regular or audit reports', () => {
    const {operatingsystems} = getMockReport();

    const {render} = rendererWith({
      gmp: createGmp(),
    });

    render(
      <OperatingSystemsTable
        // @ts-expect-error entities are ReportOperatingSystem[], not Model[]
        entities={operatingsystems?.entities ?? []}
        entitiesCounts={operatingsystems?.counts}
        filter={filter}
      />,
    );

    const table = screen.getByRole('table');

    const columnHeaders = within(table).getAllByRole('columnheader');

    expect(columnHeaders).toHaveLength(3);

    expect(columnHeaders.some(th => /Severity/i.exec(th.textContent))).toBe(
      false,
    );
  });
});

/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {screen, rendererWith, within} from 'web/testing';
import Filter from 'gmp/models/filter';
import {SEVERITY_RATING_CVSS_3} from 'gmp/utils/severity';
import {getMockReport} from 'web/pages/reports/__fixtures__/MockReport';
import ContainerScanningHostsTab from 'web/pages/reports/details/ContainerScanningHostsTab';
import {setTimezone, setUsername} from 'web/store/usersettings/actions';

const filter = Filter.fromString(
  'apply_overrides=0 levels=hml rows=2 min_qod=70 first=1 sort-reverse=severity',
);
const gmp = {
  settings: {
    severityRating: SEVERITY_RATING_CVSS_3,
  },
};

describe('Container Scanning Hosts Tab tests', () => {
  test('should render Container Scanning Hosts Tab', () => {
    const {hosts} = getMockReport();
    if (!hosts?.entities) {
      throw new Error('Mock report did not return hosts or hosts.entities');
    }
    const onSortChange = testing.fn();
    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
      router: true,
      store: true,
    });
    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));
    render(
      <ContainerScanningHostsTab
        counts={hosts.counts}
        filter={filter}
        hosts={hosts.entities}
        isUpdating={false}
        sortField={'severity'}
        sortReverse={true}
        onSortChange={sortField => onSortChange('hosts', sortField)}
      />,
    );
    // Table
    const table = screen.getByRole('table');
    // Headings - Use getAllByRole for headers that may appear more than once
    const columnHeaders = within(table).getAllByRole('columnheader');
    expect(columnHeaders.some(th => /IP Address/i.exec(th.textContent))).toBe(
      true,
    );
    expect(columnHeaders.some(th => /OS/i.exec(th.textContent))).toBe(true);
    expect(columnHeaders.some(th => /High/i.exec(th.textContent))).toBe(true);
    expect(columnHeaders.some(th => /Medium/i.exec(th.textContent))).toBe(true);
    expect(columnHeaders.some(th => /Low/i.exec(th.textContent))).toBe(true);
    expect(columnHeaders.some(th => /Log/i.exec(th.textContent))).toBe(true);
    expect(
      columnHeaders.some(th => /False Positive/i.exec(th.textContent)),
    ).toBe(true);
    expect(columnHeaders.some(th => /Total/i.exec(th.textContent))).toBe(true);
    expect(columnHeaders.some(th => /Severity/i.exec(th.textContent))).toBe(
      true,
    );

    // Find all rows (excluding header)
    const allRows = within(table).getAllByRole('row');
    // Filter out header row by checking for cells
    const dataRows = allRows.filter(
      row => within(row).queryAllByRole('cell').length > 0,
    );

    // Row assertions by cell content, not index
    // Row with IP '123.456.78.910'
    const firstRow = dataRows.find(row =>
      within(row).queryByText(/123\.456\.78\.910/),
    );
    expect(firstRow).toBeTruthy();
    if (firstRow) {
      const cells = within(firstRow).getAllByRole('cell');
      expect(cells.some(cell => cell.textContent === '14')).toBe(true); // High
      expect(cells.some(cell => cell.textContent === '30')).toBe(true); // Medium
      expect(cells.some(cell => cell.textContent === '5')).toBe(true); // Low
      expect(cells.some(cell => cell.textContent === '0')).toBe(true); // Log
      expect(cells.some(cell => cell.textContent === '1')).toBe(true); // False Positive
      expect(cells.some(cell => cell.textContent === '50')).toBe(true); // Total
      expect(
        screen
          .getAllByTestId('progressbar-box')
          .some(bar => bar.textContent?.includes('10.0 (Critical)')),
      ).toBe(true);
    }

    const secondRow = dataRows.find(row =>
      within(row).queryByText(/109\.876\.54\.321/),
    );
    expect(secondRow).toBeTruthy();
    if (secondRow) {
      const cells = within(secondRow).getAllByRole('cell');
      expect(cells.some(cell => cell.textContent === '5')).toBe(true); // High
      expect(cells.some(cell => cell.textContent === '30')).toBe(true); // Medium
      expect(cells.some(cell => cell.textContent === '0')).toBe(true); // Low
      expect(cells.some(cell => cell.textContent === '5')).toBe(true); // Log (another 5)
      expect(cells.some(cell => cell.textContent === '0')).toBe(true); // False Positive
      expect(cells.some(cell => cell.textContent === '40')).toBe(true); // Total
      expect(
        screen
          .getAllByTestId('progressbar-box')
          .some(bar => bar.textContent?.includes('5.0 (Medium)')),
      ).toBe(true);
    }

    // Filter
    expect(
      screen.getByText(
        '(Applied filter: apply_overrides=0 levels=hml rows=2 min_qod=70 first=1 sort-reverse=severity)',
      ),
    ).toBeInTheDocument();

    // Pagination - Check that pagination controls are present (both top and bottom)
    expect(screen.getAllByText('1 - 2 of 2')).toHaveLength(2);
    expect(screen.getAllByTestId('first-icon')).toHaveLength(2);
    expect(screen.getAllByTestId('previous-icon')).toHaveLength(2);
    expect(screen.getAllByTestId('next-icon')).toHaveLength(2);
    expect(screen.getAllByTestId('last-icon')).toHaveLength(2);
  });
});

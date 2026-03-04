/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test, testing} from '@gsa/testing';
import {rendererWith, screen, within} from 'web/testing';
import Filter from 'gmp/models/filter';
import {SEVERITY_RATING_CVSS_3} from 'gmp/utils/severity';
import {getMockReport} from 'web/pages/reports/__fixtures__/MockReport';
import AgentScanningHostsTab from 'web/pages/reports/details/AgentScanningHostsTab';
import {setTimezone, setUsername} from 'web/store/usersettings/actions';

const filter = Filter.fromString(
  'apply_overrides=0 levels=hml rows=2 min_qod=70 first=1 sort-reverse=severity',
);
const gmp = {
  settings: {
    severityRating: SEVERITY_RATING_CVSS_3,
  },
};

describe('Agent Scanning Hosts Tab tests', () => {
  test('should render Agent Scanning Hosts Tab', () => {
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
      <AgentScanningHostsTab
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
    expect(columnHeaders.some(th => /Hostname/i.exec(th.textContent))).toBe(
      true,
    );
    expect(columnHeaders.some(th => /Agent ID/i.exec(th.textContent))).toBe(
      true,
    );
    expect(columnHeaders.some(th => /OS/i.exec(th.textContent))).toBe(true);
    expect(columnHeaders.some(th => /Ports/i.exec(th.textContent))).toBe(true);
    expect(columnHeaders.some(th => /Apps/i.exec(th.textContent))).toBe(true);
    expect(columnHeaders.some(th => /Distance/i.exec(th.textContent))).toBe(
      true,
    );
    expect(columnHeaders.some(th => /Auth/i.exec(th.textContent))).toBe(true);
    // CVSSv3 shows Critical column
    expect(columnHeaders.some(th => /Critical/i.exec(th.textContent))).toBe(
      true,
    );
    expect(columnHeaders.some(th => /High/i.exec(th.textContent))).toBe(true);
    expect(columnHeaders.some(th => /Medium/i.exec(th.textContent))).toBe(true);
    expect(columnHeaders.some(th => /Low/i.exec(th.textContent))).toBe(true);
    expect(columnHeaders.some(th => /Log/i.exec(th.textContent))).toBe(true);
    expect(columnHeaders.some(th => /False Pos\./i.exec(th.textContent))).toBe(
      true,
    );
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
      expect(cells.some(cell => cell.textContent === 'foo.bar')).toBe(true); // Hostname
      expect(cells.some(cell => cell.textContent === '10')).toBe(true); // Ports
      expect(cells.some(cell => cell.textContent === '3')).toBe(true); // Apps
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

  test('should handle sorting', () => {
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
      <AgentScanningHostsTab
        counts={hosts.counts}
        filter={filter}
        hosts={hosts.entities}
        isUpdating={false}
        sortField={'ip'}
        sortReverse={false}
        onSortChange={onSortChange}
      />,
    );

    expect(onSortChange).not.toHaveBeenCalled();
  });
});

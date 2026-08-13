/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test, testing} from '@gsa/testing';
import {fireEvent, render, screen} from 'web/testing';
import {vi} from 'vitest';
import QueryFilter from 'gmp/models/filter/query-filter';
import StatusDisplay from 'web/components/dashboard/display/status/StatusDisplay';

interface DonutProbeProps {
  data?: Array<{filterValue?: string}>;
  show3d?: boolean;
  onDataClick?: (data: {filterValue?: string}) => void;
}

vi.mock('web/components/chart/Donut', () => ({
  default: ({data = [], onDataClick, show3d}: DonutProbeProps) => (
    <div>
      <span data-testid="show-3d">{String(show3d)}</span>
      <span data-testid="data-count">{data.length}</span>
      <button
        data-testid="data-click"
        onClick={() => onDataClick?.({filterValue: 'active'})}
      />
    </div>
  ),
}));

const createProps = (overrides = {}) => ({
  data: {items: ['raw']},
  dataRow: () => ['active'],
  dataTitles: ['Status'],
  dataTransform: () => [
    {color: 'green', filterValue: 'active', label: 'Active', value: 1},
  ],
  height: 100,
  icons: () => null,
  id: 'status-display',
  initialState: {show3d: true},
  onRemoveClick: () => {},
  onSelectFilterClick: () => {},
  children: () => null,
  setState: () => ({show3d: true}),
  showCsvDownload: false,
  showFilterSelection: false,
  showFilterString: false,
  showSvgDownload: false,
  showToggleLegend: true,
  state: {show3d: true},
  title: ({data}) => `Status (${data.length})`,
  width: 200,
  ...overrides,
});

describe('StatusDisplay', () => {
  test('should render the donut with 3D enabled and transformed data', () => {
    render(<StatusDisplay {...createProps()} />);

    expect(screen.getByTestId('show-3d')).toHaveTextContent('true');
    expect(screen.getByTestId('data-count')).toHaveTextContent('1');
  });

  test('should create a status filter when a chart item is clicked', () => {
    const onFilterChanged = testing.fn();

    render(<StatusDisplay {...createProps({onFilterChanged})} />);

    fireEvent.click(screen.getByTestId('data-click'));

    expect(onFilterChanged).toHaveBeenCalledWith(
      QueryFilter.fromString('status="active"'),
    );
  });

  test('should add the status term to an existing filter', () => {
    const onFilterChanged = testing.fn();
    const filter = QueryFilter.fromString('severity=high');

    render(<StatusDisplay {...createProps({filter, onFilterChanged})} />);

    fireEvent.click(screen.getByTestId('data-click'));

    expect(onFilterChanged).toHaveBeenCalledTimes(1);
    expect(onFilterChanged.mock.calls[0][0].toFilterString()).toBe(
      'severity=high and status="active"',
    );
  });
});

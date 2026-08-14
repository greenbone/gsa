/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {
  afterEach,
  beforeEach,
  describe,
  expect,
  test,
  testing,
} from '@gsa/testing';
import {fireEvent, render, screen} from 'web/testing';
import {vi} from 'vitest';
import QueryFilter from 'gmp/models/filter/query-filter';
import {parseDate} from 'gmp/parser';
import {type LineData} from 'web/components/chart/base/Line';
import transformCreated, {
  type CreatedDataPoint,
} from 'web/components/dashboard/display/created/created-transform';
import CreatedDisplay from 'web/components/dashboard/display/created/CreatedDisplay';

interface LineProbeProps {
  data?: CreatedDataPoint[];
  onRangeSelected?: (start: LineData, end: LineData) => void;
  xAxisLabel?: string;
  yAxisLabel?: string;
}

let selectSameDate = false;

const startDate = parseDate('2024-01-15T12:00:00Z');
const endDate = parseDate('2024-01-16T12:00:00Z');

vi.mock('web/components/chart/base/Line', () => ({
  default: ({
    data = [],
    onRangeSelected,
    xAxisLabel,
    yAxisLabel,
  }: LineProbeProps) => (
    <div>
      <span data-testid="data-count">{data.length}</span>
      <span data-testid="x-axis-label">{xAxisLabel}</span>
      <span data-testid="y-axis-label">{yAxisLabel}</span>
      <button
        data-testid="range-select"
        onClick={() => {
          if (startDate && endDate) {
            onRangeSelected?.(data[0] ?? {x: startDate, y: 1, y2: 1}, {
              x: selectSameDate ? startDate : endDate,
              y: 1,
              y2: 1,
            });
          }
        }}
      />
    </div>
  ),
}));

const createProps = (overrides = {}) => ({
  data: {
    groups: [
      {value: '2024-01-15T12:00:00Z', count: '4', c_count: '6'},
      {value: '2024-01-16T12:00:00Z', count: '2', c_count: '3'},
    ],
  },
  dataRow: () => [],
  dataTitles: ['Created', 'Count'],
  dataTransform: transformCreated,
  height: 100,
  icons: () => null,
  id: 'created-display',
  initialState: {},
  onSelectFilterClick: () => {},
  setState: () => ({}),
  showCsvDownload: false,
  showFilterSelection: false,
  showFilterString: false,
  showSvgDownload: false,
  showToggleLegend: false,
  state: {},
  title: () => 'Created',
  width: 200,
  xAxisLabel: 'Created',
  yAxisLabel: 'Count',
  ...overrides,
});

describe('CreatedDisplay', () => {
  beforeEach(() => {
    selectSameDate = false;
  });

  afterEach(() => {
    selectSameDate = false;
  });

  test('should render transformed data and axis labels', () => {
    render(<CreatedDisplay {...createProps()} />);

    expect(screen.getByTestId('data-count')).toHaveTextContent('2');
    expect(screen.getByTestId('x-axis-label')).toHaveTextContent('Created');
    expect(screen.getByTestId('y-axis-label')).toHaveTextContent('Count');
  });

  test('should create a date range filter when a range is selected', () => {
    const onFilterChanged = testing.fn();

    render(<CreatedDisplay {...createProps({onFilterChanged})} />);
    fireEvent.click(screen.getByTestId('range-select'));

    expect(onFilterChanged.mock.calls[0][0].toFilterString()).toBe(
      'created>2024-01-15t13:00 and created<2024-01-16t13:00',
    );
  });

  test('should expand a range when the same date is selected', () => {
    const onFilterChanged = testing.fn();
    selectSameDate = true;

    render(<CreatedDisplay {...createProps({onFilterChanged})} />);
    fireEvent.click(screen.getByTestId('range-select'));

    expect(onFilterChanged).toHaveBeenCalledTimes(1);
    expect(onFilterChanged.mock.calls[0][0].toFilterString()).toBe(
      'created>2024-01-14t13:00 and created<2024-01-16t13:00',
    );
  });

  test('should add the date range to an existing filter', () => {
    const onFilterChanged = testing.fn();
    const filter = QueryFilter.fromString('status="active"');

    render(<CreatedDisplay {...createProps({filter, onFilterChanged})} />);
    fireEvent.click(screen.getByTestId('range-select'));

    expect(onFilterChanged.mock.calls[0][0].toFilterString()).toBe(
      'status="active" and created>2024-01-15t13:00 and created<2024-01-16t13:00',
    );
  });

  test('should not throw when selecting a range without a callback', () => {
    render(<CreatedDisplay {...createProps()} />);

    expect(() =>
      fireEvent.click(screen.getByTestId('range-select')),
    ).not.toThrow();
  });
});

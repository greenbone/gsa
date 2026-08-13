/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test, testing} from '@gsa/testing';
import {fireEvent, rendererWith, screen} from 'web/testing';
import {vi} from 'vitest';
import QueryFilter from 'gmp/models/filter/query-filter';
import {SEVERITY_RATING_CVSS_3} from 'gmp/utils/severity';
import {type SeverityClassData} from 'web/components/dashboard/display/severity/severity-class-transform';
import SeverityClassDisplay from 'web/components/dashboard/display/severity/SeverityClassDisplay';

interface DonutProbeProps {
  data?: SeverityClassData[];
  onDataClick?: (data: SeverityClassData) => void;
  show3d?: boolean;
}

vi.mock('web/components/chart/Donut', () => ({
  default: ({data = [], onDataClick, show3d}: DonutProbeProps) => (
    <div>
      <span data-testid="show-3d">{String(show3d)}</span>
      <span data-testid="data-count">{data.length}</span>
      <button
        data-testid="data-click"
        onClick={() => {
          const firstData = data[0];
          if (firstData) {
            onDataClick?.(firstData);
          }
        }}
      />
    </div>
  ),
}));

const createGmp = () => ({
  settings: {
    severityRating: SEVERITY_RATING_CVSS_3,
  },
});

const createProps = (overrides = {}) => ({
  data: {
    groups: [{value: '7.5', count: 1}],
  },
  dataRow: () => [],
  dataTitles: ['Severity'],
  dataTransform: () => [],
  height: 100,
  icons: () => null,
  id: 'severity-display',
  initialState: {show3d: true},
  onSelectFilterClick: () => {},
  children: () => null,
  setState: () => ({show3d: true}),
  showCsvDownload: false,
  showFilterSelection: false,
  showFilterString: false,
  showSvgDownload: false,
  showToggleLegend: true,
  state: {show3d: true},
  title: ({data}: {data: SeverityClassData[]}) => `Severity (${data.length})`,
  width: 200,
  ...overrides,
});

describe('SeverityClassDisplay', () => {
  test('should render the donut with transformed data and 3D enabled', () => {
    const {render} = rendererWith({gmp: createGmp()});
    render(<SeverityClassDisplay {...createProps()} />);

    expect(screen.getByTestId('show-3d')).toHaveTextContent('true');
    expect(screen.getByTestId('data-count')).toHaveTextContent('1');
  });

  test('should create a severity range filter when a chart item is clicked', () => {
    const onFilterChanged = testing.fn();
    const {render} = rendererWith({gmp: createGmp()});

    render(<SeverityClassDisplay {...createProps({onFilterChanged})} />);

    fireEvent.click(screen.getByTestId('data-click'));

    expect(onFilterChanged).toHaveBeenCalledWith(
      QueryFilter.fromString('severity>7.0 and severity<8.9'),
    );
  });

  test('should create a single severity filter for the log class', () => {
    const onFilterChanged = testing.fn();
    const {render} = rendererWith({gmp: createGmp()});

    render(
      <SeverityClassDisplay
        {...createProps({
          data: {groups: [{value: '0', count: 1}]},
          onFilterChanged,
        })}
      />,
    );

    fireEvent.click(screen.getByTestId('data-click'));

    expect(onFilterChanged).toHaveBeenCalledWith(
      QueryFilter.fromString('severity=0'),
    );
  });

  test('should add the severity filter to an existing filter', () => {
    const onFilterChanged = testing.fn();
    const filter = QueryFilter.fromString('status="active"');
    const {render} = rendererWith({gmp: createGmp()});

    render(
      <SeverityClassDisplay {...createProps({filter, onFilterChanged})} />,
    );

    fireEvent.click(screen.getByTestId('data-click'));

    expect(onFilterChanged).toHaveBeenCalledTimes(1);
    expect(onFilterChanged.mock.calls[0][0].toFilterString()).toBe(
      'status="active" and severity>7.0 and severity<8.9',
    );
  });

  test('should not change the filter when the severity range is already selected', () => {
    const onFilterChanged = testing.fn();
    const filter = QueryFilter.fromString('severity>7.0 and severity<8.9');
    const {render} = rendererWith({gmp: createGmp()});

    render(
      <SeverityClassDisplay {...createProps({filter, onFilterChanged})} />,
    );

    fireEvent.click(screen.getByTestId('data-click'));

    expect(onFilterChanged).not.toHaveBeenCalled();
  });
});

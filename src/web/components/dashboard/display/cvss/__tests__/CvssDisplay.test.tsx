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
import {fireEvent, rendererWith, screen} from 'web/testing';
import {vi} from 'vitest';
import QueryFilter from 'gmp/models/filter/query-filter';
import {SEVERITY_RATING_CVSS_3} from 'gmp/utils/severity';
import {type CvssDataPoint} from 'web/components/dashboard/display/cvss/cvss-transform';
import CvssDisplay from 'web/components/dashboard/display/cvss/CvssDisplay';

interface BarProbeProps {
  data?: CvssDataPoint[];
  onDataClick?: (data: CvssDataPoint) => void;
  xLabel?: string;
  yLabel?: string;
}

let probeDataPoint: Omit<CvssDataPoint, 'filterValue'> | undefined;
let probeValue = '7';

vi.mock('web/components/chart/BarChart', () => ({
  default: ({data = [], onDataClick, xLabel, yLabel}: BarProbeProps) => (
    <div>
      <span data-testid="data-count">{data.length}</span>
      <span data-testid="x-label">{xLabel}</span>
      <span data-testid="y-label">{yLabel}</span>
      <button
        data-testid="data-click"
        onClick={() => {
          const dataPoint =
            probeDataPoint ?? data.find(({x}) => x === probeValue);
          if (dataPoint) {
            onDataClick?.(dataPoint as CvssDataPoint);
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
  dataTitles: ['CVSS', 'Count'],
  dataTransform: () => [],
  height: 100,
  icons: () => null,
  id: 'cvss-display',
  initialState: {},
  onSelectFilterClick: () => {},
  setState: () => ({}),
  showCsvDownload: false,
  showFilterSelection: false,
  showFilterString: false,
  showSvgDownload: false,
  showToggleLegend: false,
  state: {},
  title: () => 'CVSS',
  width: 200,
  xLabel: 'Severity',
  yLabel: 'Count',
  ...overrides,
});

describe('CvssDisplay', () => {
  beforeEach(() => {
    probeValue = '7';
    probeDataPoint = undefined;
  });

  afterEach(() => {
    probeValue = '7';
    probeDataPoint = undefined;
  });

  test('should render the transformed data and chart labels', () => {
    const {render} = rendererWith({gmp: createGmp()});
    render(<CvssDisplay {...createProps()} />);

    expect(screen.getByTestId('data-count')).toHaveTextContent('13');
    expect(screen.getByTestId('x-label')).toHaveTextContent('Severity');
    expect(screen.getByTestId('y-label')).toHaveTextContent('Count');
  });

  test('should create a range filter when a chart item is clicked', () => {
    const onFilterChanged = testing.fn();
    const {render} = rendererWith({gmp: createGmp()});

    render(<CvssDisplay {...createProps({onFilterChanged})} />);
    fireEvent.click(screen.getByTestId('data-click'));

    expect(onFilterChanged).toHaveBeenCalledWith(
      QueryFilter.fromString('severity>6.9 and severity<8.0'),
    );
  });

  test('should add the range filter to an existing filter', () => {
    const onFilterChanged = testing.fn();
    const filter = QueryFilter.fromString('status="active"');
    const {render} = rendererWith({gmp: createGmp()});

    render(<CvssDisplay {...createProps({filter, onFilterChanged})} />);
    fireEvent.click(screen.getByTestId('data-click'));

    expect(onFilterChanged.mock.calls[0][0].toFilterString()).toBe(
      'status="active" and severity>6.9 and severity<8.0',
    );
  });

  test('should not change an already selected range filter', () => {
    const onFilterChanged = testing.fn();
    const filter = QueryFilter.fromString('severity>6.9 and severity<8.0');
    const {render} = rendererWith({gmp: createGmp()});

    render(<CvssDisplay {...createProps({filter, onFilterChanged})} />);
    fireEvent.click(screen.getByTestId('data-click'));

    expect(onFilterChanged).not.toHaveBeenCalled();
  });

  test('should create an equality filter for a single-value bucket', () => {
    const onFilterChanged = testing.fn();
    probeValue = '10';
    const {render} = rendererWith({gmp: createGmp()});

    render(
      <CvssDisplay
        {...createProps({
          data: {groups: [{value: '10', count: 1}]},
          onFilterChanged,
        })}
      />,
    );
    fireEvent.click(screen.getByTestId('data-click'));

    expect(onFilterChanged).toHaveBeenCalledWith(
      QueryFilter.fromString('severity=10'),
    );
  });

  test('should create an empty-severity filter when a chart point has no start', () => {
    const onFilterChanged = testing.fn();
    probeDataPoint = {
      color: 'black',
      label: 'Unknown',
      toolTip: 'Unknown',
      x: 'Unknown',
      y: 1,
    };
    const {render} = rendererWith({gmp: createGmp()});

    render(
      <CvssDisplay
        {...createProps({
          onFilterChanged,
        })}
      />,
    );
    fireEvent.click(screen.getByTestId('data-click'));

    expect(onFilterChanged).toHaveBeenCalledWith(
      QueryFilter.fromString('severity=""'),
    );
  });
});

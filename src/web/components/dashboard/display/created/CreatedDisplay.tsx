/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useCallback} from 'react';
import {isDate} from 'gmp/models/date';
import {type FilterType} from 'gmp/models/filter';
import {isDefined} from 'gmp/utils/identity';
import LineChart, {type LineData} from 'web/components/chart/base/Line';
import transformCreated, {
  type CreatedData,
  type CreatedDataPoint,
} from 'web/components/dashboard/display/created/created-transform';
import DataDisplay, {
  type DataDisplayProps,
  type State,
} from 'web/components/dashboard/display/DataDisplay';
import {createDateRangeFilter} from 'web/components/dashboard/display/utils';

interface CreatedDisplayProps extends DataDisplayProps<
  CreatedData,
  State,
  CreatedDataPoint
> {
  filter?: FilterType;
  xAxisLabel?: string;
  yAxisLabel?: string;
  y2AxisLabel?: string;
  yLine?: {color: string; label: string};
  y2Line?: {color: string; label: string};
  onFilterChanged?: (filter: FilterType) => void;
}

const CreatedDisplay = ({
  dataTransform = transformCreated,
  filter,
  xAxisLabel,
  y2AxisLabel,
  y2Line,
  yAxisLabel,
  yLine,
  onFilterChanged,
  ...props
}: CreatedDisplayProps) => {
  const handleRangeSelect = useCallback(
    (start: LineData, end: LineData) => {
      if (!isDefined(onFilterChanged)) {
        return;
      }

      const {x: startDate} = start;
      const {x: endDate} = end;

      if (isDate(startDate) && isDate(endDate)) {
        onFilterChanged(
          createDateRangeFilter({
            endDate,
            field: 'created',
            filter,
            formatDate: date => date.utc().format(),
            startDate,
          }),
        );
      }
    },
    [filter, onFilterChanged],
  );
  return (
    <DataDisplay<CreatedData, CreatedDisplayProps, State, CreatedDataPoint>
      {...props}
      dataTransform={dataTransform}
      filter={filter}
    >
      {({width, height, data, svgRef, state}) => (
        <LineChart
          timeline
          data={data}
          height={height}
          showLegend={state.showLegend}
          svgRef={svgRef}
          width={width}
          xAxisLabel={xAxisLabel}
          y2AxisLabel={y2AxisLabel}
          y2Line={y2Line}
          yAxisLabel={yAxisLabel}
          yLine={yLine}
          onRangeSelected={
            isDefined(onFilterChanged) ? handleRangeSelect : undefined
          }
        />
      )}
    </DataDisplay>
  );
};

export default CreatedDisplay;

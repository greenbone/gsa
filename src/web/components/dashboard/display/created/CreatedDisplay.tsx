/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useCallback} from 'react';
import {isDate} from 'gmp/models/date';
import {type FilterType} from 'gmp/models/filter';
import FilterTerm from 'gmp/models/filter/filter-term';
import QueryFilter from 'gmp/models/filter/query-filter';
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

      let {x: startDate} = start;
      let {x: endDate} = end;

      let newFilter = isDefined(filter) ? filter.copy() : new QueryFilter();

      if (isDate(startDate) && isDate(endDate)) {
        if (startDate.isSame(endDate)) {
          startDate = startDate.clone().subtract(1, 'day');
          endDate = endDate.clone().add(1, 'day');
        }

        const startTerm = FilterTerm.fromString(
          `created>${startDate.utc().format()}`,
        );

        if (!newFilter.hasTerm(startTerm)) {
          newFilter = newFilter.and(QueryFilter.fromTerm(startTerm));
        }
      }

      if (isDate(endDate)) {
        const endTerm = FilterTerm.fromString(
          `created<${endDate.utc().format()}`,
        );

        if (!newFilter.hasTerm(endTerm)) {
          newFilter = newFilter.and(QueryFilter.fromTerm(endTerm));
        }
      }

      onFilterChanged(newFilter);
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

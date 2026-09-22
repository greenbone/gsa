/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useCallback} from 'react';
import {isDate} from 'gmp/models/date';
import {type FilterType} from 'gmp/models/filter';
import {type ToString} from 'gmp/types';
import {isDefined} from 'gmp/utils/identity';
import LineChart, {
  type LineData,
  type LineProps,
} from 'web/components/chart/LineChart';
import {type CreatedDataPoint} from 'web/components/dashboard/display/created/created-transform';
import DataDisplay, {
  type TransformFunc,
  type DataDisplayProps,
} from 'web/components/dashboard/display/DataDisplay';
import {createDateRangeFilter} from 'web/components/dashboard/display/utils';

type CreatedDataDisplayProps<
  TData extends object,
  TTransformedData extends CreatedDataPoint[],
> = DataDisplayProps<TData, TTransformedData>;

export interface CreatedDisplayProps<
  TData extends object,
  TTransformedData extends CreatedDataPoint[],
> extends Omit<
  CreatedDataDisplayProps<TData, TTransformedData>,
  'dataTransform' | 'children'
> {
  dataTransform: TransformFunc<TData, TTransformedData>;
  xAxisLabel?: ToString;
  yAxisLabel?: ToString;
  y2AxisLabel?: ToString;
  yLine?: LineProps;
  y2Line?: LineProps;
  onFilterChanged?: (filter: FilterType) => void;
}

const CreatedDisplay = <
  TData extends object,
  TTransformedData extends CreatedDataPoint[],
>({
  dataTransform,
  filter,
  xAxisLabel,
  y2AxisLabel,
  y2Line,
  yAxisLabel,
  yLine,
  onFilterChanged,
  ...props
}: CreatedDisplayProps<TData, TTransformedData>) => {
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
    <DataDisplay<
      TData,
      CreatedDataDisplayProps<TData, TTransformedData>,
      TTransformedData
    >
      {...props}
      dataTransform={dataTransform}
      filter={filter}
    >
      {({width, height, data, svgRef, state}) => (
        <LineChart
          timeline
          data={data}
          height={height}
          showLegend={state?.showLegend}
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

/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useCallback} from 'react';
import {type FilterType} from 'gmp/models/filter';
import FilterTerm from 'gmp/models/filter/filter-term';
import QueryFilter from 'gmp/models/filter/query-filter';
import {isDefined} from 'gmp/utils/identity';
import {isEmpty} from 'gmp/utils/string';
import DonutChart, {type DonutChartData} from 'web/components/chart/DonutChart';
import DataDisplay, {
  type DataDisplayProps,
} from 'web/components/dashboard/display/DataDisplay';
import DataDisplayIcons from 'web/components/dashboard/display/DataDisplayIcons';

interface StatusData extends DonutChartData {
  filterValue?: string;
}

interface StatusDisplayProps<
  TData,
  TTransformData extends Array<StatusData> = StatusData[],
> extends DataDisplayProps<TData, TTransformData> {
  filter?: FilterType;
  filterTerm?: string;
  onFilterChanged?: (filter: FilterType) => void;
}

const StatusDisplay = <
  TData,
  TTransformData extends Array<StatusData> = StatusData[],
>({
  filter,
  filterTerm = 'status',
  onFilterChanged,
  ...props
}: StatusDisplayProps<TData, TTransformData>) => {
  const handleDataClick = useCallback(
    ({filterValue}: TTransformData[number]) => {
      if (isEmpty(filterValue) || !isDefined(onFilterChanged)) {
        return;
      }
      const statusTerm = FilterTerm.fromString(
        `${filterTerm}="${filterValue}"`,
      );

      if (isDefined(filter) && filter.hasTerm(statusTerm)) {
        return;
      }

      const statusFilter = QueryFilter.fromTerm(statusTerm);
      const newFilter = isDefined(filter)
        ? filter.copy().and(statusFilter)
        : statusFilter;

      onFilterChanged(newFilter);
    },
    [filter, filterTerm, onFilterChanged],
  );
  return (
    <DataDisplay<
      TData,
      StatusDisplayProps<TData, TTransformData>,
      TTransformData
    >
      {...props}
      filter={filter}
      icons={DataDisplayIcons}
      initialState={{}}
    >
      {({width, height, data, svgRef, state}) => (
        <DonutChart<TTransformData[number]>
          data={data}
          height={height}
          showLegend={state.showLegend}
          svgRef={svgRef}
          width={width}
          onDataClick={isDefined(onFilterChanged) ? handleDataClick : undefined}
          onLegendItemClick={
            isDefined(onFilterChanged) ? handleDataClick : undefined
          }
        />
      )}
    </DataDisplay>
  );
};

export default StatusDisplay;

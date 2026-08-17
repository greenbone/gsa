/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useCallback} from 'react';
import {type FilterType} from 'gmp/models/filter';
import FilterTerm from 'gmp/models/filter/filter-term';
import QueryFilter from 'gmp/models/filter/query-filter';
import {isDefined} from 'gmp/utils/identity';
import DonutChart, {type DonutChartData} from 'web/components/chart/DonutChart';
import DataDisplay, {
  type DataDisplayProps,
  type State,
} from 'web/components/dashboard/display/DataDisplay';
import {renderDonutChartIcons} from 'web/components/dashboard/display/DataDisplayIcons';

interface StatusData extends DonutChartData {
  filterValue?: string;
}

interface StatusState extends State {
  show3d: boolean;
}

interface StatusDisplayProps<TData = unknown> extends DataDisplayProps<
  TData,
  StatusState,
  StatusData
> {
  filter?: FilterType;
  filterTerm?: string;
  onFilterChanged?: (filter: FilterType) => void;
}

const StatusDisplay = <TData,>({
  filter,
  filterTerm = 'status',
  onFilterChanged,
  ...props
}: StatusDisplayProps<TData>) => {
  const handleDataClick = useCallback(
    ({filterValue}: StatusData) => {
      if (isDefined(filterValue) && isDefined(onFilterChanged)) {
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
      }
    },
    [filter, filterTerm, onFilterChanged],
  );
  return (
    <DataDisplay<TData, StatusDisplayProps<TData>, StatusState, StatusData>
      {...props}
      filter={filter}
      icons={renderDonutChartIcons}
      initialState={{
        show3d: true,
      }}
    >
      {({width, height, data: tdata, svgRef, state}) => (
        <DonutChart<StatusData>
          data={tdata}
          height={height}
          show3d={state.show3d}
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

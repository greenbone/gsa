/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {type FilterType} from 'gmp/models/filter';
import QueryFilter from 'gmp/models/filter/query-filter';
import {isDefined} from 'gmp/utils/identity';
import DonutChart from 'web/components/chart/DonutChart';
import DataDisplay, {
  type DataDisplayProps,
} from 'web/components/dashboard/display/DataDisplay';
import DataDisplayIcons from 'web/components/dashboard/display/DataDisplayIcons';
import {
  type TransformedSeverityClassData,
  type TransformedSeverityClassDataItem,
} from 'web/components/dashboard/display/severity/severity-class-transform';
import {filterValueToFilterTerms} from 'web/components/dashboard/display/severity/utils';

type SeverityClassDisplayBaseProps =
  DataDisplayProps<TransformedSeverityClassData>;

interface SeverityClassDisplayProps extends SeverityClassDisplayBaseProps {
  filter?: FilterType;
  onFilterChanged?: (filter: FilterType) => void;
}

type SeverityClassDataDisplayProps = SeverityClassDisplayBaseProps;

const SeverityClassDisplay = ({
  onFilterChanged,
  filter,
  ...props
}: SeverityClassDisplayProps) => {
  const handleDataClick = (data: TransformedSeverityClassDataItem) => {
    const {filterValue} = data;

    if (!isDefined(onFilterChanged)) {
      return;
    }

    let severityFilter: FilterType;
    const [startTerm, endTerm] = filterValueToFilterTerms(filterValue);
    if (!isDefined(startTerm)) {
      return;
    }

    if (isDefined(endTerm)) {
      if (
        isDefined(filter) &&
        filter.hasTerm(startTerm) &&
        filter.hasTerm(endTerm)
      ) {
        return;
      }

      severityFilter = QueryFilter.fromTerm(startTerm).and(
        QueryFilter.fromTerm(endTerm),
      );
    } else {
      if (isDefined(filter) && filter.hasTerm(startTerm)) {
        return;
      }

      severityFilter = QueryFilter.fromTerm(startTerm);
    }

    const newFilter = isDefined(filter)
      ? filter.and(severityFilter)
      : severityFilter;

    onFilterChanged(newFilter);
  };
  return (
    <DataDisplay<TransformedSeverityClassData, SeverityClassDataDisplayProps>
      {...props}
      filter={filter}
      icons={DataDisplayIcons}
      initialState={{}}
    >
      {({width, height, data, svgRef, state}) => (
        <DonutChart
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

export default SeverityClassDisplay;

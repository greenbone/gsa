/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {type FilterType} from 'gmp/models/filter';
import QueryFilter from 'gmp/models/filter/query-filter';
import {isDefined} from 'gmp/utils/identity';
import {type SeverityRating} from 'gmp/utils/severity';
import DonutChart from 'web/components/chart/DonutChart';
import DataDisplay, {
  type State,
  type DataDisplayProps,
} from 'web/components/dashboard/display/DataDisplay';
import {renderDonutChartIcons} from 'web/components/dashboard/display/DataDisplayIcons';
import transformSeverityData, {
  type SeverityClassData,
  type SeverityData,
  type TransformSeverityDataProps,
} from 'web/components/dashboard/display/severity/severity-class-transform';
import {filterValueToFilterTerms} from 'web/components/dashboard/display/severity/utils';
import useGmp from 'web/hooks/useGmp';

interface SeverityClassDisplayState extends State {
  show3d: boolean;
}

type SeverityClassDisplayBaseProps = DataDisplayProps<
  SeverityData,
  SeverityClassDisplayState,
  SeverityClassData,
  TransformSeverityDataProps
>;

interface SeverityClassDisplayProps extends SeverityClassDisplayBaseProps {
  filter?: FilterType;
  onFilterChanged?: (filter: FilterType) => void;
}

interface SeverityClassDataDisplayProps extends SeverityClassDisplayBaseProps {
  severityRating: SeverityRating;
}

const SeverityClassDisplay = ({
  onFilterChanged,
  filter,
  ...props
}: SeverityClassDisplayProps) => {
  const gmp = useGmp();
  const severityRating = gmp.settings.severityRating;
  const handleDataClick = (data: SeverityClassData) => {
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
    <DataDisplay<
      SeverityData,
      SeverityClassDataDisplayProps,
      SeverityClassDisplayState,
      SeverityClassData,
      TransformSeverityDataProps
    >
      {...props}
      dataTransform={transformSeverityData}
      filter={filter}
      icons={renderDonutChartIcons}
      initialState={{
        show3d: true,
      }}
      severityRating={severityRating}
    >
      {({width, height, data, svgRef, state}) => (
        <DonutChart
          data={data}
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

export default SeverityClassDisplay;

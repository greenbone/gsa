/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Filter from 'gmp/models/filter';
import {isDefined} from 'gmp/utils/identity';
import DonutChart from 'web/components/chart/Donut';
import DataDisplay, {
  DataDisplayProps,
} from 'web/components/dashboard/display/DataDisplay';
import {renderDonutChartIcons} from 'web/components/dashboard/display/DataDisplayIcons';
import transformSeverityData, {
  SeverityClassData,
  SeverityData,
  TransformSeverityDataProps,
} from 'web/components/dashboard/display/severity/severityClassTransform';
import {filterValueToFilterTerms} from 'web/components/dashboard/display/severity/utils';
import useGmp from 'web/hooks/useGmp';

interface SeverityClassDisplayProps
  extends DataDisplayProps<
    SeverityData,
    SeverityClassDisplayState,
    SeverityClassData,
    TransformSeverityDataProps
  > {
  filter?: Filter;
  onFilterChanged?: (filter: Filter) => void;
}

interface SeverityClassDisplayState {
  show3d: boolean;
  showLegend?: boolean;
}

interface SeverityClassDataDisplayProps
  extends DataDisplayProps<
    SeverityData,
    SeverityClassDisplayState,
    SeverityClassData,
    TransformSeverityDataProps
  > {
  severityRating: string;
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

    let severityFilter: Filter;
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

      severityFilter = Filter.fromTerm(startTerm).and(Filter.fromTerm(endTerm));
    } else {
      if (isDefined(filter) && filter.hasTerm(startTerm)) {
        return;
      }

      severityFilter = Filter.fromTerm(startTerm);
    }

    const newFilter = isDefined(filter)
      ? filter.copy().and(severityFilter)
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

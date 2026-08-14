/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {type FilterType} from 'gmp/models/filter';
import FilterTerm from 'gmp/models/filter/filter-term';
import QueryFilter from 'gmp/models/filter/query-filter';
import {parseFloat} from 'gmp/parser';
import {isDefined} from 'gmp/utils/identity';
import {type SeverityRating} from 'gmp/utils/severity';
import BarChart from 'web/components/chart/BarChart';
import transformCvssData, {
  type CvssData,
  type CvssDataPoint,
  type TransformCvssDataProps,
} from 'web/components/dashboard/display/cvss/cvss-transform';
import DataDisplay, {
  type DataDisplayProps,
  type State,
} from 'web/components/dashboard/display/DataDisplay';
import useGmp from 'web/hooks/useGmp';
import useTranslation from 'web/hooks/useTranslation';

type CvssDisplayState = State;

type CvssDataDisplayBaseProps = DataDisplayProps<
  CvssData,
  CvssDisplayState,
  CvssDataPoint,
  TransformCvssDataProps
>;

interface CvssDisplayProps extends CvssDataDisplayBaseProps {
  filter?: FilterType;
  onFilterChanged?: (filter: FilterType) => void;
  xLabel?: string;
  yLabel?: string;
}

interface CvssDataDisplayProps extends CvssDataDisplayBaseProps {
  severityRating: SeverityRating;
}

const CvssDisplay = ({
  filter,
  title,
  yLabel,
  xLabel,
  onFilterChanged,
  ...props
}: CvssDisplayProps) => {
  const [_] = useTranslation();
  xLabel = xLabel || _('Severity');
  const gmp = useGmp();
  const severityRating = gmp.settings.severityRating;
  const handleDataClick = (data: CvssDataPoint) => {
    if (!isDefined(onFilterChanged)) {
      return;
    }

    const {filterValue = {}} = data;
    const {start, end} = filterValue;

    let statusFilter: FilterType;

    const startValue = parseFloat(start);
    if (isDefined(startValue) && isDefined(end) && startValue >= 0) {
      const startTerm = FilterTerm.fromString(`severity>${start}`);
      const endTerm = FilterTerm.fromString(`severity<${end}`);

      if (
        isDefined(filter) &&
        filter.hasTerm(startTerm) &&
        filter.hasTerm(endTerm)
      ) {
        return;
      }

      statusFilter = QueryFilter.fromTerm(startTerm).and(
        QueryFilter.fromTerm(endTerm),
      );
    } else {
      const statusTerm = isDefined(start)
        ? FilterTerm.fromString(`severity=${start}`)
        : FilterTerm.fromString('severity=""');

      if (isDefined(filter) && filter.hasTerm(statusTerm)) {
        return;
      }

      statusFilter = QueryFilter.fromTerm(statusTerm);
    }

    const newFilter = isDefined(filter)
      ? filter.copy().and(statusFilter)
      : statusFilter;

    onFilterChanged(newFilter);
  };
  return (
    <DataDisplay<
      CvssData,
      CvssDataDisplayProps,
      CvssDisplayState,
      CvssDataPoint,
      TransformCvssDataProps
    >
      {...props}
      dataTransform={transformCvssData}
      severityRating={severityRating}
      showToggleLegend={false}
      title={title}
    >
      {({width, height, data, svgRef}) => {
        return (
          <BarChart<CvssDataPoint>
            data={data}
            height={height}
            svgRef={svgRef}
            width={width}
            xLabel={xLabel}
            yLabel={yLabel}
            onDataClick={
              isDefined(onFilterChanged) ? handleDataClick : undefined
            }
          />
        );
      }}
    </DataDisplay>
  );
};

export default CvssDisplay;

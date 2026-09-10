/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {type FilterType} from 'gmp/models/filter';
import FilterTerm from 'gmp/models/filter/filter-term';
import QueryFilter from 'gmp/models/filter/query-filter';
import {parseFloat} from 'gmp/parser';
import {type ToString} from 'gmp/types';
import {isDefined} from 'gmp/utils/identity';
import {type SeverityRating} from 'gmp/utils/severity';
import BarChart from 'web/components/chart/BarChart';
import transformCvssData, {
  type TransformedCvssData,
  type CvssData,
  type CvssDataPoint,
  type TransformCvssDataProps,
} from 'web/components/dashboard/display/cvss/cvss-transform';
import DataDisplay, {
  type DataDisplayProps,
} from 'web/components/dashboard/display/DataDisplay';
import useGmp from 'web/hooks/useGmp';
import useTranslation from 'web/hooks/useTranslation';

type CvssDataDisplayBaseProps = DataDisplayProps<
  CvssData,
  TransformedCvssData,
  TransformCvssDataProps
>;

interface CvssDisplayProps extends Omit<
  CvssDataDisplayBaseProps,
  'dataTransform'
> {
  filter?: FilterType;
  onFilterChanged?: (filter: FilterType) => void;
  xLabel?: ToString;
  yLabel?: ToString;
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
      TransformedCvssData,
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
            xLabel={String(xLabel)}
            yLabel={String(yLabel)}
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

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
import BarChart from 'web/components/chart/BarChart';
import {
  type TransformedCvssData,
  type TransformedCvssDataItem,
} from 'web/components/dashboard/display/cvss/cvss-transform';
import DataDisplay, {
  type DataDisplayProps,
} from 'web/components/dashboard/display/DataDisplay';
import useTranslation from 'web/hooks/useTranslation';

type CvssDataDisplayBaseProps = DataDisplayProps<TransformedCvssData>;

interface CvssDisplayProps extends CvssDataDisplayBaseProps {
  onFilterChanged?: (filter: FilterType) => void;
  xLabel?: ToString;
  yLabel?: ToString;
}

const CvssDisplay = ({
  data,
  dataRow,
  children,
  filter,
  title,
  yLabel,
  xLabel,
  onFilterChanged,
  ...props
}: CvssDisplayProps) => {
  const [_] = useTranslation();
  xLabel = xLabel || _('Severity');

  const handleDataClick = (data: TransformedCvssDataItem) => {
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
    <DataDisplay<TransformedCvssData, DataDisplayProps<TransformedCvssData>>
      {...props}
      data={data}
      showToggleLegend={false}
      title={title}
    >
      {({width, height, data, svgRef}) => {
        return (
          <BarChart<TransformedCvssDataItem>
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

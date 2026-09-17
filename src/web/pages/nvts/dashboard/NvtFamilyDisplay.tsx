/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {_, _l} from 'gmp/locale/lang';
import {NVTS_FILTER_FILTER} from 'gmp/models/filter';
import FilterTerm from 'gmp/models/filter/filter-term';
import QueryFilter from 'gmp/models/filter/query-filter';
import {parseFloat, parseSeverity} from 'gmp/parser';
import {isDefined} from 'gmp/utils/identity';
import {DEFAULT_SEVERITY_RATING, type SeverityRating} from 'gmp/utils/severity';
import {isEmpty} from 'gmp/utils/string';
import BubbleChart from 'web/components/chart/BubbleChart';
import {type DashboardDisplayProps} from 'web/components/dashboard/DashboardView';
import createDisplay from 'web/components/dashboard/display/createDisplay';
import DataDisplay, {
  type DataDisplayProps,
} from 'web/components/dashboard/display/DataDisplay';
import DataTableDisplay from 'web/components/dashboard/display/DataTableDisplay';
import useFilterSelection from 'web/components/dashboard/display/useFilterSelection';
import {riskFactorColorScale} from 'web/components/dashboard/display/utils';
import {registerDisplay} from 'web/components/dashboard/registry';
import useGmp from 'web/hooks/useGmp';
import {
  type NvtFamilyData,
  NvtsFamilyLoader,
} from 'web/pages/nvts/dashboard/NvtLoaders';
import {severityFormat} from 'web/utils/Render';
import {NA_VALUE, resultSeverityRiskFactor} from 'web/utils/severity';

interface TransformedNvtFamilyDataItem {
  value: number;
  color: string;
  label: string;
  toolTip: string;
  severity: string;
  filterValue: string;
}

interface TransformedNvtFamilyData extends Array<TransformedNvtFamilyDataItem> {
  total: number;
}

interface TransformFamilyDataProps {
  severityRating?: SeverityRating;
}

type NvtFamilyDataDisplayProps = DataDisplayProps<
  NvtFamilyData,
  TransformedNvtFamilyData,
  TransformFamilyDataProps
>;

type NvtsFamilyDisplayProps = DashboardDisplayProps;

const transformFamilyData = (
  data: NvtFamilyData = {},
  {severityRating = DEFAULT_SEVERITY_RATING}: TransformFamilyDataProps = {},
): TransformedNvtFamilyData => {
  const {groups = []} = data;
  const totalNvts = groups.reduce(
    (prev, current) => prev + (parseFloat(current.count) ?? 0),
    0,
  );

  const transformedData = groups.map(family => {
    const {count, value} = family;
    const severity = parseSeverity(family.stats.severity.mean) ?? NA_VALUE;
    const riskFactor = resultSeverityRiskFactor(severity, severityRating);
    const formattedSeverity = severityFormat(severity);
    const toolTip = _('{{value}}: {{count}} (severity: {{severity}})', {
      value: value,
      count: count,
      severity: formattedSeverity,
    });

    return {
      value: parseFloat(count),
      color: riskFactorColorScale(riskFactor),
      label: value,
      toolTip,
      severity: formattedSeverity,
      filterValue: value,
    } as TransformedNvtFamilyDataItem;
  });

  const result = transformedData as TransformedNvtFamilyData;
  result.total = totalNvts;
  return result;
};

export const NvtsFamilyDisplay = ({
  filter,
  filterId,
  showFilterSelection,
  onFilterIdChanged,
  onFilterChanged,
  ...props
}: NvtsFamilyDisplayProps) => {
  const gmp = useGmp();

  const {
    filter: selectedFilter,
    selectFilter,
    filterSelectionDialog,
  } = useFilterSelection({
    filterId,
    filtersFilter: NVTS_FILTER_FILTER,
    onFilterIdChanged,
  });
  const displayFilter = showFilterSelection ? selectedFilter : filter;

  const handleDataClick = ({filterValue}: TransformedNvtFamilyDataItem) => {
    if (!isDefined(onFilterChanged) || isEmpty(filterValue)) {
      return;
    }

    const familyTerm = FilterTerm.fromString(`family="${filterValue}"`);

    if (isDefined(displayFilter) && displayFilter.hasTerm(familyTerm)) {
      return;
    }
    const familyFilter = QueryFilter.fromTerm(familyTerm);

    const newFilter = isDefined(displayFilter)
      ? displayFilter.and(familyFilter)
      : familyFilter;

    onFilterChanged(newFilter);
  };

  const severityRating = gmp.settings.severityRating;

  return (
    <>
      <NvtsFamilyLoader filter={displayFilter}>
        {loaderProps => (
          <DataDisplay<
            NvtFamilyData,
            NvtFamilyDataDisplayProps,
            TransformedNvtFamilyData,
            TransformFamilyDataProps
          >
            {...props}
            {...loaderProps}
            dataTransform={transformFamilyData}
            filter={displayFilter}
            severityRating={severityRating}
            showToggleLegend={false}
            title={({data}) =>
              _('NVTs by Family (Total: {{count}})', {count: data.total})
            }
            onSelectFilterClick={showFilterSelection ? selectFilter : undefined}
          >
            {({width, height, data, svgRef}) => (
              <BubbleChart<TransformedNvtFamilyDataItem>
                data={data}
                height={height}
                svgRef={svgRef}
                width={width}
                onDataClick={
                  isDefined(onFilterChanged) ? handleDataClick : undefined
                }
              />
            )}
          </DataDisplay>
        )}
      </NvtsFamilyLoader>
      {filterSelectionDialog}
    </>
  );
};

NvtsFamilyDisplay.displayId = 'nvt-by-family';

export const NvtsFamilyTableDisplay = createDisplay({
  loaderComponent: NvtsFamilyLoader,
  displayComponent: props => (
    <DataTableDisplay
      {...props}
      dataRow={row => [row.label, row.value, row.severity]}
      dataTitles={[_('NVT Family'), _('# of NVTs'), _('Severity')]}
      dataTransform={transformFamilyData}
      title={({data}) =>
        _('NVTs by Family (Total: {{count}})', {count: data.total})
      }
    />
  ),
  displayId: 'nvt-by-family-table',
  displayName: 'NvtsFamilyTableDisplay',
  filtersFilter: NVTS_FILTER_FILTER,
});

registerDisplay(NvtsFamilyDisplay, _l('Chart: NVTs by Family'));

registerDisplay(NvtsFamilyTableDisplay, _l('Table: NVTs by Family'));

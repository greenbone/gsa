/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {_, _l} from 'gmp/locale/lang';
import {NVTS_FILTER_FILTER} from 'gmp/models/filter';
import FilterTerm from 'gmp/models/filter/filter-term';
import QueryFilter from 'gmp/models/filter/query-filter';
import {parseFloat} from 'gmp/parser';
import {isDefined} from 'gmp/utils/identity';
import {isEmpty} from 'gmp/utils/string';
import DonutChart from 'web/components/chart/DonutChart';
import {type DashboardDisplayProps} from 'web/components/dashboard/DashboardView';
import createDisplay from 'web/components/dashboard/display/createDisplay';
import DataDisplay, {
  type DataDisplayProps,
} from 'web/components/dashboard/display/DataDisplay';
import DataDisplayIcons from 'web/components/dashboard/display/DataDisplayIcons';
import DataTableDisplay from 'web/components/dashboard/display/DataTableDisplay';
import useFilterSelection from 'web/components/dashboard/display/useFilterSelection';
import {
  totalCount,
  percent,
  qodColorScale,
} from 'web/components/dashboard/display/utils';
import {registerDisplay} from 'web/components/dashboard/registry';
import {
  type NvtQodData,
  NvtsQodLoader,
} from 'web/pages/nvts/dashboard/NvtLoaders';

interface TransformedNvtQodDataItem {
  value: number;
  label: string;
  toolTip: string;
  color: string;
  filterValue: string;
}

interface TransformedNvtQodData extends Array<TransformedNvtQodDataItem> {
  total: number;
}

type NvtQodDataDisplayProps = DataDisplayProps<
  NvtQodData,
  TransformedNvtQodData
>;

type NvtsQodDisplayProps = DashboardDisplayProps;

const transformQodData = (data: NvtQodData = {}): TransformedNvtQodData => {
  const {groups = []} = data;
  const sum = totalCount(groups);

  const transformedData = groups.map(group => {
    const {count, value} = group;
    const perc = percent(count, sum);

    return {
      value: parseFloat(count),
      label: value + ' %',
      toolTip: `${value}%: ${perc}% (${count})`,
      color: qodColorScale(parseFloat(value) ?? 0),
      filterValue: value,
    } as TransformedNvtQodDataItem;
  });

  const result = transformedData as TransformedNvtQodData;
  result.total = sum;

  return result;
};

export const NvtsQodDisplay = ({
  filter,
  filterId,
  showFilterSelection,
  onFilterIdChanged,
  onFilterChanged,
  ...props
}: NvtsQodDisplayProps) => {
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

  const handleDataClick = ({filterValue}) => {
    if (!isDefined(onFilterChanged) || isEmpty(filterValue)) {
      return;
    }

    const qodTerm = FilterTerm.fromString(`qod="${filterValue}"`);

    if (isDefined(displayFilter) && displayFilter.hasTerm(qodTerm)) {
      return;
    }
    const qodFilter = QueryFilter.fromTerm(qodTerm);

    const newFilter = isDefined(displayFilter)
      ? displayFilter.and(qodFilter)
      : qodFilter;

    onFilterChanged(newFilter);
  };

  return (
    <>
      <NvtsQodLoader filter={displayFilter}>
        {loaderProps => (
          <DataDisplay<
            NvtQodData,
            NvtQodDataDisplayProps,
            TransformedNvtQodData
          >
            {...props}
            {...loaderProps}
            dataTransform={transformQodData}
            icons={DataDisplayIcons}
            initialState={{}}
            title={({data}) =>
              _('NVTs by QoD (Total: {{count}})', {count: data?.total ?? 0})
            }
            onSelectFilterClick={showFilterSelection ? selectFilter : undefined}
          >
            {({width, height, data, svgRef, state}) => (
              <DonutChart
                data={data}
                height={height}
                showLegend={state.showLegend}
                svgRef={svgRef}
                width={width}
                onDataClick={
                  isDefined(onFilterChanged) ? handleDataClick : undefined
                }
              />
            )}
          </DataDisplay>
        )}
      </NvtsQodLoader>
      {filterSelectionDialog}
    </>
  );
};

NvtsQodDisplay.displayId = 'nvt-by-qod';

export const NvtsQodTableDisplay = createDisplay({
  loaderComponent: NvtsQodLoader,
  displayComponent: props => (
    <DataTableDisplay
      {...props}
      dataRow={transformedData =>
        transformedData?.map(row => [row.label ?? '', row.value]) ?? []
      }
      dataTitles={[_('QoD'), _('# of NVTs')]}
      dataTransform={transformQodData}
      title={({data}) =>
        _('NVTs by QoD (Total: {{count}})', {count: data?.total ?? 0})
      }
    />
  ),
  displayId: 'nvt-by-qod-table',
  displayName: 'NvtsQodTableDisplay',
  filtersFilter: NVTS_FILTER_FILTER,
});

registerDisplay(NvtsQodDisplay, _l('Chart: NVTs by QoD'));

registerDisplay(NvtsQodTableDisplay, _l('Table: NVTs by QoD'));

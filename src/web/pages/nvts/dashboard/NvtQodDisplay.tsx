/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useCallback} from 'react';
import {_, _l} from 'gmp/locale/lang';
import {NVTS_FILTER_FILTER} from 'gmp/models/filter';
import FilterTerm from 'gmp/models/filter/filter-term';
import QueryFilter from 'gmp/models/filter/query-filter';
import {parseFloat} from 'gmp/parser';
import {isDefined} from 'gmp/utils/identity';
import {isEmpty} from 'gmp/utils/string';
import DonutChart from 'web/components/chart/DonutChart';
import createDisplay from 'web/components/dashboard/display/createDisplay';
import DataDisplay, {
  type DataDisplayProps,
} from 'web/components/dashboard/display/DataDisplay';
import DataDisplayIcons from 'web/components/dashboard/display/DataDisplayIcons';
import DataTableDisplay from 'web/components/dashboard/display/DataTableDisplay';
import useDataTransform from 'web/components/dashboard/display/useDataTransform';
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

type NvtQodDataDisplayProps = DataDisplayProps<TransformedNvtQodData>;

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

export const NvtsQodDisplay = createDisplay({
  loaderComponent: NvtsQodLoader,
  displayComponent: ({data, filter, onFilterChanged, ...props}) => {
    const transformedData = useDataTransform(data, transformQodData);
    const handleDataClick = useCallback(
      ({filterValue}) => {
        if (!isDefined(onFilterChanged) || isEmpty(filterValue)) {
          return;
        }

        const qodTerm = FilterTerm.fromString(`qod="${filterValue}"`);

        if (isDefined(filter) && filter.hasTerm(qodTerm)) {
          return;
        }
        const qodFilter = QueryFilter.fromTerm(qodTerm);

        const newFilter = isDefined(filter) ? filter.and(qodFilter) : qodFilter;

        onFilterChanged(newFilter);
      },
      [filter, onFilterChanged],
    );
    return (
      <DataDisplay<TransformedNvtQodData, NvtQodDataDisplayProps>
        {...props}
        data={transformedData}
        filter={filter}
        icons={DataDisplayIcons}
        initialState={{}}
        title={({data}) =>
          _('NVTs by QoD (Total: {{count}})', {count: data?.total ?? 0})
        }
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
    );
  },
  filtersFilter: NVTS_FILTER_FILTER,
  displayName: 'NvtsQodDisplay',
  displayId: 'nvt-by-qod',
});

export const NvtsQodTableDisplay = createDisplay({
  loaderComponent: NvtsQodLoader,
  displayComponent: ({data, ...props}) => {
    const transformedData = useDataTransform(data, transformQodData);
    return (
      <DataTableDisplay
        {...props}
        data={transformedData}
        dataRow={transformedData =>
          transformedData?.map(row => [row.label ?? '', row.value]) ?? []
        }
        dataTitles={[_('QoD'), _('# of NVTs')]}
        title={({data}) =>
          _('NVTs by QoD (Total: {{count}})', {count: data?.total ?? 0})
        }
      />
    );
  },
  displayId: 'nvt-by-qod-table',
  displayName: 'NvtsQodTableDisplay',
  filtersFilter: NVTS_FILTER_FILTER,
});

registerDisplay(NvtsQodDisplay, _l('Chart: NVTs by QoD'));

registerDisplay(NvtsQodTableDisplay, _l('Table: NVTs by QoD'));

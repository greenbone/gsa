/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useCallback} from 'react';
import {_, _l} from 'gmp/locale/lang';
import {NVTS_FILTER_FILTER} from 'gmp/models/filter';
import FilterTerm from 'gmp/models/filter/filter-term';
import QueryFilter from 'gmp/models/filter/query-filter';
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
  qodTypeColorScale,
  QOD_TYPES,
} from 'web/components/dashboard/display/utils';
import {registerDisplay} from 'web/components/dashboard/registry';
import {
  type NvtQodData,
  NvtsQodTypeLoader,
} from 'web/pages/nvts/dashboard/NvtLoaders';

interface TransformedNvtQodTypeDataItem {
  color: string;
  filterValue: string;
  label: string;
  toolTip: string;
  value: number;
}

interface TransformedNvtQodTypeData extends Array<TransformedNvtQodTypeDataItem> {
  total: number;
}

type NvtQodTypeDataDisplayProps = DataDisplayProps<TransformedNvtQodTypeData>;

const transformQodTypeData = (
  data: NvtQodData = {},
): TransformedNvtQodTypeData => {
  const {groups = []} = data;
  const sum = totalCount(groups);

  const transformedData = groups.map(group => {
    const {count, value} = group;
    const perc = percent(count, sum);
    return {
      value: count,
      label: `${QOD_TYPES[value]}`,
      toolTip: `${QOD_TYPES[value]}: ${perc}% (${count})`,
      color: qodTypeColorScale(value),
      filterValue: String(value),
    } as TransformedNvtQodTypeDataItem;
  });

  const result = transformedData as TransformedNvtQodTypeData;
  result.total = sum;

  return result;
};

export const NvtsQodTypeDisplay = createDisplay({
  loaderComponent: NvtsQodTypeLoader,
  displayComponent: ({data, filter, onFilterChanged, ...props}) => {
    const transformedData = useDataTransform(data, transformQodTypeData);
    const handleDataClick = useCallback(
      ({filterValue}) => {
        if (!isDefined(onFilterChanged) || isEmpty(filterValue)) {
          return;
        }

        const qodTypeTerm = FilterTerm.fromString(`qod_type="${filterValue}"`);

        if (isDefined(filter) && filter.hasTerm(qodTypeTerm)) {
          return;
        }
        const qodTypeFilter = QueryFilter.fromTerm(qodTypeTerm);

        const newFilter = isDefined(filter)
          ? filter.and(qodTypeFilter)
          : qodTypeFilter;

        onFilterChanged(newFilter);
      },
      [filter, onFilterChanged],
    );
    return (
      <DataDisplay<TransformedNvtQodTypeData, NvtQodTypeDataDisplayProps>
        {...props}
        data={transformedData}
        filter={filter}
        icons={DataDisplayIcons}
        initialState={{}}
        title={({data}) =>
          _('NVTs by QoD-Type (Total: {{count}})', {
            count: data?.total ?? 0,
          })
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
  displayId: 'nvt-by-qod_type',
  displayName: 'NvtsQodTypeDisplay',
});

export const NvtsQodTypeTableDisplay = createDisplay({
  loaderComponent: NvtsQodTypeLoader,
  displayComponent: ({data, ...props}) => {
    const transformedData = useDataTransform(data, transformQodTypeData);
    return (
      <DataTableDisplay
        {...props}
        data={transformedData}
        dataRow={transformedData =>
          transformedData?.map(row => [row.label ?? '', row.value]) ?? []
        }
        dataTitles={[_('QoD-Type'), _('# of NVTs')]}
        title={({data}) =>
          _('NVTs by QoD-Type (Total: {{count}})', {count: data?.total ?? 0})
        }
      />
    );
  },
  displayId: 'nvt-by-qod-type-table',
  displayName: 'NvtsQodTypeTableDisplay',
  filtersFilter: NVTS_FILTER_FILTER,
});

registerDisplay(NvtsQodTypeDisplay, _l('Chart: NVTs by QoD-Type'));

registerDisplay(NvtsQodTypeTableDisplay, _l('Table: NVTs by QoD-Type'));

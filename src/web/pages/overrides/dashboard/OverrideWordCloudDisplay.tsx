/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useCallback} from 'react';
import {_, _l} from 'gmp/locale/lang';
import {OVERRIDES_FILTER_FILTER} from 'gmp/models/filter';
import FilterTerm from 'gmp/models/filter/filter-term';
import QueryFilter from 'gmp/models/filter/query-filter';
import {parseFloat} from 'gmp/parser';
import {isDefined} from 'gmp/utils/identity';
import {isEmpty} from 'gmp/utils/string';
import WordCloudChart from 'web/components/chart/WordCloudChart';
import createDisplay from 'web/components/dashboard/display/createDisplay';
import DataDisplay, {
  type DataDisplayProps,
} from 'web/components/dashboard/display/DataDisplay';
import DataTableDisplay from 'web/components/dashboard/display/DataTableDisplay';
import useDataTransform from 'web/components/dashboard/display/useDataTransform';
import {randomColor} from 'web/components/dashboard/display/utils';
import {registerDisplay} from 'web/components/dashboard/registry';
import {
  OverridesWordCountLoader,
  type OverrideWordCloudData,
} from 'web/pages/overrides/dashboard/OverrideLoaders';

interface TransformedWordCloudDataItem {
  value: number;
  label: string;
  color: string;
  filterValue: string;
}

type TransformedWordCloudData = TransformedWordCloudDataItem[];

type OverrideWordCloudDataDisplayProps =
  DataDisplayProps<TransformedWordCloudData>;

const transformWordCountData = (
  data: OverrideWordCloudData = {},
): TransformedWordCloudData => {
  const {groups = []} = data;
  const transformedData = groups.map(group => {
    const {count, value} = group;
    return {
      value: parseFloat(count),
      label: value,
      color: randomColor(),
      filterValue: value,
    } as TransformedWordCloudDataItem;
  });
  return transformedData;
};

export const OverridesWordCloudDisplay = createDisplay({
  loaderComponent: OverridesWordCountLoader,
  displayComponent: ({data, filter, onFilterChanged, ...props}) => {
    const transformedData = useDataTransform(data, transformWordCountData);
    const handleDataClick = useCallback(
      (filterValue: string) => {
        if (!isDefined(onFilterChanged) || isEmpty(filterValue)) {
          return;
        }

        const wordTerm = FilterTerm.fromString(`text~"${filterValue}"`);

        if (isDefined(filter) && filter.hasTerm(wordTerm)) {
          return;
        }
        const wordFilter = QueryFilter.fromTerm(wordTerm);
        const newFilter = isDefined(filter)
          ? filter.and(wordFilter)
          : wordFilter;

        onFilterChanged(newFilter);
      },
      [filter, onFilterChanged],
    );
    return (
      <DataDisplay<TransformedWordCloudData, OverrideWordCloudDataDisplayProps>
        {...props}
        data={transformedData}
        filter={filter}
        showToggleLegend={false}
        title={() => _('Overrides Text Word Cloud')}
      >
        {({width, height, data, svgRef}) => (
          <WordCloudChart
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
    );
  },
  displayId: 'override-by-text-words',
  displayName: 'OverridesWordCloudDisplay',
  filtersFilter: OVERRIDES_FILTER_FILTER,
});

export const OverridesWordCloudTableDisplay = createDisplay({
  loaderComponent: OverridesWordCountLoader,
  displayComponent: ({data, ...props}) => {
    const transformedData = useDataTransform(data, transformWordCountData);
    return (
      <DataTableDisplay
        {...props}
        data={transformedData}
        dataRow={transformedData =>
          transformedData?.map(row => [row.label, row.value]) ?? []
        }
        dataTitles={[_('Text'), _('Count')]}
        title={() => _('Overrides Text Word Cloud')}
      />
    );
  },

  displayId: 'override-by-text-words-table',
  displayName: 'OverridesWordCloudTableDisplay',
  filtersFilter: OVERRIDES_FILTER_FILTER,
});

registerDisplay(
  OverridesWordCloudDisplay,
  _l('Chart: Overrides Text Word Cloud'),
);

registerDisplay(
  OverridesWordCloudTableDisplay,
  _l('Table: Overrides Text Word Cloud'),
);

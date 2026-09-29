/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useCallback} from 'react';
import {_, _l} from 'gmp/locale/lang';
import {RESULTS_FILTER_FILTER} from 'gmp/models/filter';
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
  ResultsDescriptionWordCountLoader,
  type ResultWordCloudData,
} from 'web/pages/results/dashboard/ResultLoaders';

interface TransformResultWordCountDataItem {
  value: number;
  label: string;
  color: string;
  filterValue: string;
}

type TransformResultWordCountData = TransformResultWordCountDataItem[];

type ResultWordCountDataDisplayProps =
  DataDisplayProps<TransformResultWordCountData>;

const transformWordCountData = (
  data: ResultWordCloudData = {},
): TransformResultWordCountData => {
  const {groups = []} = data;
  const transformedData = groups.map(group => {
    const {count, value} = group;
    return {
      value: parseFloat(count),
      label: value,
      color: randomColor(),
      filterValue: value,
    } as TransformResultWordCountDataItem;
  });
  return transformedData;
};

export const ResultsDescriptionWordCloudDisplay = createDisplay({
  loaderComponent: ResultsDescriptionWordCountLoader,
  displayComponent: ({data, filter, onFilterChanged, ...props}) => {
    const transformedData = useDataTransform(data, transformWordCountData);
    const handleDataClick = useCallback(
      (filterValue: string) => {
        if (!isDefined(onFilterChanged) || isEmpty(filterValue)) {
          return;
        }

        const wordTerm = FilterTerm.fromString(`description~"${filterValue}"`);

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
      <DataDisplay<
        TransformResultWordCountData,
        ResultWordCountDataDisplayProps
      >
        {...props}
        data={transformedData}
        filter={filter}
        showToggleLegend={false}
        title={() => _('Results Description Word Cloud')}
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
  displayId: 'result-by-desc-words',
  displayName: 'ResultsDescriptionWordCloudDisplay',
  filtersFilter: RESULTS_FILTER_FILTER,
});

export const ResultsDescriptionWordCloudTableDisplay = createDisplay({
  loaderComponent: ResultsDescriptionWordCountLoader,
  displayComponent: ({data, ...props}) => {
    const transformedData = useDataTransform(data, transformWordCountData);
    return (
      <DataTableDisplay
        {...props}
        data={transformedData}
        dataRow={transformedData =>
          transformedData?.map(row => [row.label, row.value]) ?? []
        }
        dataTitles={[_('Description'), _('Word Count')]}
        title={() => _('Results Description Word Cloud')}
      />
    );
  },
  displayId: 'result-by-desc-words-table',
  displayName: 'ResultsDescriptionWordCloudTableDisplay',
  filtersFilter: RESULTS_FILTER_FILTER,
});

registerDisplay(
  ResultsDescriptionWordCloudDisplay,
  _l('Chart: Results Description Word Cloud'),
);

registerDisplay(
  ResultsDescriptionWordCloudTableDisplay,
  _l('Table: Results Description Word Cloud'),
);

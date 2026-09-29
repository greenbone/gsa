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
  ResultsWordCountLoader,
  type ResultWordCloudData,
} from 'web/pages/results/dashboard/ResultLoaders';

interface TransformedResultWordCloudDataItem {
  value: number;
  label: string;
  color: string;
  filterValue: string;
}

type TransformedResultWordCloudData = TransformedResultWordCloudDataItem[];

type ResultWordCloudDataDisplayProps =
  DataDisplayProps<TransformedResultWordCloudData>;

const transformWordCountData = (
  data: ResultWordCloudData = {},
): TransformedResultWordCloudData => {
  const {groups = []} = data;
  const transformedData = groups.map(group => {
    const {count, value} = group;
    return {
      value: parseFloat(count),
      label: value,
      color: randomColor(),
      filterValue: value,
    } as TransformedResultWordCloudDataItem;
  });
  return transformedData;
};

export const ResultsWordCloudDisplay = createDisplay({
  loaderComponent: ResultsWordCountLoader,
  displayComponent: ({data, filter, onFilterChanged, ...props}) => {
    const transformedData = useDataTransform(data, transformWordCountData);
    const handleDataClick = useCallback(
      (filterValue: string) => {
        if (!isDefined(onFilterChanged) || isEmpty(filterValue)) {
          return;
        }

        const wordTerm = FilterTerm.fromString(
          `vulnerability~"${filterValue}"`,
        );

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
        TransformedResultWordCloudData,
        ResultWordCloudDataDisplayProps
      >
        {...props}
        data={transformedData}
        filter={filter}
        showToggleLegend={false}
        title={() => _('Results Vulnerability Word Cloud')}
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
  filtersFilter: RESULTS_FILTER_FILTER,
  displayId: 'result-by-vuln-words',
  displayName: 'ResultsWordCloudDisplay',
});

export const ResultsWordCloudTableDisplay = createDisplay({
  loaderComponent: ResultsWordCountLoader,
  displayComponent: ({data, ...props}) => {
    const transformedData = useDataTransform(data, transformWordCountData);
    return (
      <DataTableDisplay
        {...props}
        data={transformedData}
        dataRow={transformedData =>
          transformedData?.map(row => [row.label, row.value]) ?? []
        }
        dataTitles={[_('Vulnerability'), _('Word Count')]}
        title={() => _('Results Vulnerability Word Cloud')}
      />
    );
  },
  filtersFilter: RESULTS_FILTER_FILTER,
  displayId: 'result-by-vuln-words-table',
  displayName: 'ResultsWordCloudTableDisplay',
});

registerDisplay(
  ResultsWordCloudDisplay,
  _l('Chart: Results Vulnerability Word Cloud'),
);

registerDisplay(
  ResultsWordCloudTableDisplay,
  _l('Table: Results Vulnerability Word Cloud'),
);

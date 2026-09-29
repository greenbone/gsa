/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {_, _l} from 'gmp/locale/lang';
import {RESULTS_FILTER_FILTER} from 'gmp/models/filter';
import FilterTerm from 'gmp/models/filter/filter-term';
import QueryFilter from 'gmp/models/filter/query-filter';
import {parseFloat} from 'gmp/parser';
import {isDefined} from 'gmp/utils/identity';
import {isEmpty} from 'gmp/utils/string';
import WordCloudChart from 'web/components/chart/WordCloudChart';
import {type DashboardDisplayProps} from 'web/components/dashboard/DashboardView';
import createDisplay from 'web/components/dashboard/display/createDisplay';
import DataDisplay, {
  type DataDisplayProps,
} from 'web/components/dashboard/display/DataDisplay';
import DataTableDisplay from 'web/components/dashboard/display/DataTableDisplay';
import useDataTransform from 'web/components/dashboard/display/useDataTransform';
import useFilterSelection from 'web/components/dashboard/display/useFilterSelection';
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

type ResultWordCloudDisplayProps = DashboardDisplayProps;

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

export const ResultsWordCloudDisplay = ({
  filter,
  filterId,
  showFilterSelection,
  onFilterIdChanged,
  onFilterChanged,
  ...props
}: ResultWordCloudDisplayProps) => {
  const {
    filter: selectedFilter,
    selectFilter,
    filterSelectionDialog,
  } = useFilterSelection({
    filterId,
    filtersFilter: RESULTS_FILTER_FILTER,
    onFilterIdChanged,
  });

  const displayFilter = showFilterSelection ? selectedFilter : filter;

  const handleDataClick = (filterValue: string) => {
    if (!isDefined(onFilterChanged) || isEmpty(filterValue)) {
      return;
    }

    const wordTerm = FilterTerm.fromString(`vulnerability~"${filterValue}"`);

    if (isDefined(filter) && filter.hasTerm(wordTerm)) {
      return;
    }
    const wordFilter = QueryFilter.fromTerm(wordTerm);

    const newFilter = isDefined(displayFilter)
      ? displayFilter.and(wordFilter)
      : wordFilter;

    onFilterChanged(newFilter);
  };

  return (
    <>
      <ResultsWordCountLoader filter={displayFilter}>
        {({data, isLoading}) => {
          const transformedData = transformWordCountData(data);
          return (
            <DataDisplay<
              TransformedResultWordCloudData,
              ResultWordCloudDataDisplayProps
            >
              {...props}
              data={transformedData}
              filter={displayFilter}
              isLoading={isLoading}
              showToggleLegend={false}
              title={() => _('Results Vulnerability Word Cloud')}
              onSelectFilterClick={
                showFilterSelection ? selectFilter : undefined
              }
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
        }}
      </ResultsWordCountLoader>
      {filterSelectionDialog}
    </>
  );
};

ResultsWordCloudDisplay.displayId = 'result-by-vuln-words';

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

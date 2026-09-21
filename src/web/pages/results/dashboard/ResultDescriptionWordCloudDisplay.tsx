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
import useFilterSelection from 'web/components/dashboard/display/useFilterSelection';
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

type ResultWordCountDataDisplayProps = DataDisplayProps<
  ResultWordCloudData,
  TransformResultWordCountData
>;

type ResultWordCountDisplayProps = DashboardDisplayProps;

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

export const ResultsDescriptionWordCloudDisplay = ({
  filter,
  filterId,
  showFilterSelection,
  onFilterChanged,
  onFilterIdChanged,
  ...props
}: ResultWordCountDisplayProps) => {
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

    const wordTerm = FilterTerm.fromString(`description~"${filterValue}"`);

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
      <ResultsDescriptionWordCountLoader filter={displayFilter}>
        {loaderProps => (
          <DataDisplay<
            ResultWordCloudData,
            ResultWordCountDataDisplayProps,
            TransformResultWordCountData
          >
            {...props}
            {...loaderProps}
            dataTransform={transformWordCountData}
            filter={displayFilter}
            showToggleLegend={false}
            title={() => _('Results Description Word Cloud')}
            onSelectFilterClick={showFilterSelection ? selectFilter : undefined}
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
        )}
      </ResultsDescriptionWordCountLoader>
      {filterSelectionDialog}
    </>
  );
};

ResultsDescriptionWordCloudDisplay.displayId = 'result-by-desc-words';

export const ResultsDescriptionWordCloudTableDisplay = createDisplay({
  loaderComponent: ResultsDescriptionWordCountLoader,
  displayComponent: props => (
    <DataTableDisplay
      {...props}
      dataRow={row => [row.label, row.value]}
      dataTitles={[_('Description'), _('Word Count')]}
      dataTransform={transformWordCountData}
      title={() => _('Results Description Word Cloud')}
    />
  ),
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

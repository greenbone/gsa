/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {_, _l} from 'gmp/locale/lang';
import {NOTES_FILTER_FILTER} from 'gmp/models/filter';
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
  NotesWordCountLoader,
  type WordCloudData,
} from 'web/pages/notes/dashboard/NoteLoaders';

interface TransformedWordCloudDataItem {
  value: number;
  label: string;
  color: string;
  filterValue: string;
}

type TransformedWordCloudData = TransformedWordCloudDataItem[];

type NotesWordCloudDataDisplayProps =
  DataDisplayProps<TransformedWordCloudData>;

type NotesWordCloudDisplayProps = DashboardDisplayProps;

const transformWordCountData = (
  data: WordCloudData | undefined = {},
): TransformedWordCloudDataItem[] => {
  const {groups = []} = data;
  const transformData = groups.map(group => {
    const {count, value} = group;
    return {
      value: parseFloat(count) as number,
      label: String(value),
      color: randomColor(),
      filterValue: String(value),
    };
  });
  return transformData;
};

export const NotesWordCloudDisplay = ({
  filter,
  filterId,
  showFilterSelection,
  onFilterIdChanged,
  onFilterChanged,
  ...props
}: NotesWordCloudDisplayProps) => {
  const {
    filter: selectedFilter,
    selectFilter,
    filterSelectionDialog,
  } = useFilterSelection({
    filterId,
    filtersFilter: NOTES_FILTER_FILTER,
    onFilterIdChanged,
  });
  const displayFilter = showFilterSelection ? selectedFilter : filter;

  const handleDataClick = (filterValue: string) => {
    if (!isDefined(onFilterChanged) || isEmpty(filterValue)) {
      return;
    }

    const wordTerm = FilterTerm.fromString(`text~"${filterValue}"`);

    if (isDefined(displayFilter) && displayFilter.hasTerm(wordTerm)) {
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
      <NotesWordCountLoader filter={displayFilter}>
        {({data, ...loaderProps}) => {
          const transformedData = transformWordCountData(data);
          return (
            <DataDisplay<
              TransformedWordCloudData,
              NotesWordCloudDataDisplayProps
            >
              {...props}
              {...loaderProps}
              data={transformedData}
              filter={displayFilter}
              showToggleLegend={false}
              title={() => _('Notes Text Word Cloud')}
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
      </NotesWordCountLoader>
      {filterSelectionDialog}
    </>
  );
};

NotesWordCloudDisplay.displayId = 'note-by-text-words';

export const NotesWordCloudTableDisplay = createDisplay({
  loaderComponent: NotesWordCountLoader,
  displayComponent: ({data, ...props}) => {
    const transformedData = useDataTransform(data, transformWordCountData);
    return (
      <DataTableDisplay
        {...props}
        data={transformedData}
        dataRow={transformedData =>
          transformedData?.map(row => [row.label ?? '', row.value]) ?? []
        }
        dataTitles={[_('Text'), _('Count')]}
        title={() => _('Notes Text Word Cloud')}
      />
    );
  },
  displayId: 'note-by-text-words-table',
  displayName: 'NotesWordCloudTableDisplay',
  filtersFilter: NOTES_FILTER_FILTER,
});

registerDisplay(NotesWordCloudDisplay, _l('Chart: Notes Text Word Cloud'));

registerDisplay(NotesWordCloudTableDisplay, _l('Table: Notes Text Word Cloud'));

/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useCallback} from 'react';
import {_, _l} from 'gmp/locale/lang';
import {NOTES_FILTER_FILTER} from 'gmp/models/filter';
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

export const NotesWordCloudDisplay = createDisplay({
  loaderComponent: NotesWordCountLoader,
  displayComponent: ({data, onFilterChanged, filter, ...props}) => {
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
      [onFilterChanged, filter],
    );
    return (
      <DataDisplay<TransformedWordCloudData, NotesWordCloudDataDisplayProps>
        {...props}
        data={transformedData}
        filter={filter}
        showToggleLegend={false}
        title={() => _('Notes Text Word Cloud')}
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
  displayId: 'note-by-text-words',
  displayName: 'NotesWordCloudDisplay',
  filtersFilter: NOTES_FILTER_FILTER,
});

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

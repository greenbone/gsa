/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useCallback} from 'react';
import {_, _l} from 'gmp/locale/lang';
import {NOTES_FILTER_FILTER} from 'gmp/models/filter';
import FilterTerm from 'gmp/models/filter/filter-term';
import QueryFilter from 'gmp/models/filter/query-filter';
import {
  NOTE_ACTIVE_UNLIMITED_VALUE,
  NOTE_INACTIVE_VALUE,
} from 'gmp/models/note';
import {parseFloat} from 'gmp/parser';
import {isDefined} from 'gmp/utils/identity';
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
  activeDaysColorScale,
} from 'web/components/dashboard/display/utils';
import {registerDisplay} from 'web/components/dashboard/registry';
import {
  type NotesActiveDaysData,
  NotesActiveDaysLoader,
} from 'web/pages/notes/dashboard/NoteLoaders';

interface TransformedNotesActiveDaysDataItem {
  bulked?: boolean;
  color: string;
  filterValue: string;
  label: string;
  toolTip: string;
  value: number;
}

interface TransformedNotesActiveDaysData extends Array<TransformedNotesActiveDaysDataItem> {
  total: number;
}

type NotesActiveDaysDataDisplayProps =
  DataDisplayProps<TransformedNotesActiveDaysData>;

const MAX_BINS = 10; // if this is changed, activeDaysColorScale needs adjustment

const transformActiveDaysData = (
  data: NotesActiveDaysData | undefined = {},
) => {
  const {groups = []} = data;
  const sum = totalCount(groups);

  // if more than MAX_BINS groups are loaded, bulk the last ones (those notes
  // that are active the longest) into one bin
  if (groups.length > MAX_BINS) {
    // cut off array after MAX_BINS
    const mostActiveDaysBin = groups.splice(MAX_BINS - 1);
    // get last value of the shortened group-array, as it is the largest value
    // to be shown separately. The bulked group will be labeled as bigger than
    // this value
    const {value} = groups[groups.length - 1];

    const count = mostActiveDaysBin.reduce(
      (prev, current) => prev + (parseFloat(current.count) ?? 0),
      0,
    );
    const reducedMostActiveDaysBin = {
      value,
      count,
      bulked: true, // used as flag for special label
    };

    groups.push(reducedMostActiveDaysBin);
  }

  let colorCounter = 1;
  const transformedData = groups.map(group => {
    const {bulked, count, value} = group;
    const perc = percent(count, sum);
    let label = '';
    switch (value) {
      case NOTE_ACTIVE_UNLIMITED_VALUE:
        label = _('Active (unlimited)');
        break;
      case NOTE_INACTIVE_VALUE:
        label = _('Inactive');
        break;
      default:
        if (group.bulked) {
          label = _('Active for > {{value}} days', {value});
        } else {
          label = _('Active for the next {{value}} days', {value});
        }
        break;
    }
    return {
      value: count,
      label,
      bulked,
      toolTip: `${label}: ${perc}% (${count})`,
      color: activeDaysColorScale(colorCounter++),
      filterValue: String(value),
    } as TransformedNotesActiveDaysDataItem;
  });

  const result = transformedData as unknown as TransformedNotesActiveDaysData;
  result.total = sum;
  return result;
};

export const NotesActiveDaysDisplay = createDisplay({
  loaderComponent: NotesActiveDaysLoader,
  displayComponent: ({data, onFilterChanged, filter, ...props}) => {
    const transformedData = useDataTransform(data, transformActiveDaysData);
    const handleDataClick = useCallback(
      ({filterValue, bulked = false}: TransformedNotesActiveDaysDataItem) => {
        if (!isDefined(onFilterChanged)) {
          return;
        }

        const activeDaysTerm = bulked
          ? FilterTerm.fromString(`active_days>"${filterValue}"`)
          : FilterTerm.fromString(`active_days="${filterValue}"`);

        if (isDefined(filter) && filter.hasTerm(activeDaysTerm)) {
          return;
        }
        const activeDaysFilter = QueryFilter.fromTerm(activeDaysTerm);

        const newFilter = isDefined(filter)
          ? filter.and(activeDaysFilter)
          : activeDaysFilter;

        onFilterChanged(newFilter);
      },
      [onFilterChanged, filter],
    );
    return (
      <DataDisplay<
        TransformedNotesActiveDaysData,
        NotesActiveDaysDataDisplayProps
      >
        {...props}
        data={transformedData}
        filter={filter}
        icons={DataDisplayIcons}
        initialState={{}}
        title={({data}) =>
          _('Notes by Active Days (Total: {{count}})', {
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
  filtersFilter: NOTES_FILTER_FILTER,
  displayId: 'note-by-active-days',
  displayName: 'NotesActiveDaysDisplay',
});

export const NotesActiveDaysTableDisplay = createDisplay({
  loaderComponent: NotesActiveDaysLoader,
  displayComponent: ({data, ...props}) => {
    const transformedData = useDataTransform(data, transformActiveDaysData);
    return (
      <DataTableDisplay
        {...props}
        data={transformedData}
        dataRow={transformedData =>
          transformedData?.map(row => [row.label ?? '', row.value]) ?? []
        }
        dataTitles={[_('Active'), _('# of Notes')]}
        title={({data}) =>
          _('Notes by Active Days (Total: {{count}})', {
            count: data?.total ?? 0,
          })
        }
      />
    );
  },
  displayId: 'note-by-active-days-table',
  displayName: 'NotesActiveDaysTableDisplay',
  filtersFilter: NOTES_FILTER_FILTER,
});

registerDisplay(NotesActiveDaysDisplay, _l('Chart: Notes by Active Days'));

registerDisplay(NotesActiveDaysTableDisplay, _l('Table: Notes by Active Days'));

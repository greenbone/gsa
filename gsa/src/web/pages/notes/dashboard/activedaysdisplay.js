/* Copyright (C) 2018-2021 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

import React from 'react';

import {_, _l} from 'gmp/locale/lang';

import FilterTerm from 'gmp/models/filter/filterterm';
import Filter, {NOTES_FILTER_FILTER} from 'gmp/models/filter';
import {
  NOTE_ACTIVE_UNLIMITED_VALUE,
  NOTE_INACTIVE_VALUE,
} from 'gmp/models/note';

import {parseFloat} from 'gmp/parser';

import {isDefined} from 'gmp/utils/identity';

import DonutChart from 'web/components/chart/donut';
import DataDisplay from 'web/components/dashboard/display/datadisplay';
import {renderDonutChartIcons} from 'web/components/dashboard/display/datadisplayicons'; // eslint-disable-line max-len
import DataTableDisplay from 'web/components/dashboard/display/datatabledisplay'; // eslint-disable-line max-len
import withFilterSelection from 'web/components/dashboard/display/withFilterSelection'; // eslint-disable-line max-len
import createDisplay from 'web/components/dashboard/display/createDisplay';
import {
  totalCount,
  percent,
  activeDaysColorScale,
} from 'web/components/dashboard/display/utils';
import {registerDisplay} from 'web/components/dashboard/registry';

import PropTypes from 'web/utils/proptypes';

import {NotesActiveDaysLoader} from './loaders';

const MAX_BINS = 10; // if this is changed, activeDaysColorScale needs adjustment

const transformActiveDaysData = (data = {}) => {
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
      (prev, current) => prev + parseFloat(current.count),
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
  const tdata = groups.map(group => {
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
      filterValue: value,
    };
  });

  tdata.total = sum;
  return tdata;
};

export class NotesActiveDaysDisplay extends React.Component {
  constructor(...args) {
    super(...args);

    this.handleDataClick = this.handleDataClick.bind(this);
  }

  handleDataClick(data) {
    const {onFilterChanged, filter} = this.props;
    const {filterValue, bulked = false} = data;

    if (!isDefined(onFilterChanged)) {
      return;
    }

    let activeDaysTerm;
    if (bulked) {
      activeDaysTerm = FilterTerm.fromString(`active_days>"${filterValue}"`);
    } else {
      activeDaysTerm = FilterTerm.fromString(`active_days="${filterValue}"`);
    }

    if (isDefined(filter) && filter.hasTerm(activeDaysTerm)) {
      return;
    }
    const activeDaysFilter = Filter.fromTerm(activeDaysTerm);

    const newFilter = isDefined(filter)
      ? filter.copy().and(activeDaysFilter)
      : activeDaysFilter;

    onFilterChanged(newFilter);
  }

  render() {
    const {filter, onFilterChanged, ...props} = this.props;

    return (
      <NotesActiveDaysLoader filter={filter}>
        {loaderProps => (
          <DataDisplay
            {...props}
            {...loaderProps}
            filter={filter}
            dataTransform={transformActiveDaysData}
            title={({data: tdata}) =>
              _('Notes by Active Days (Total: {{count}})', {
                count: tdata.total,
              })
            }
            initialState={{
              show3d: true,
            }}
            icons={renderDonutChartIcons}
          >
            {({width, height, data: tdata, svgRef, state}) => (
              <DonutChart
                svgRef={svgRef}
                data={tdata}
                height={height}
                width={width}
                show3d={state.show3d}
                showLegend={state.showLegend}
                onDataClick={
                  isDefined(onFilterChanged) ? this.handleDataClick : undefined
                }
              />
            )}
          </DataDisplay>
        )}
      </NotesActiveDaysLoader>
    );
  }
}

NotesActiveDaysDisplay.propTypes = {
  filter: PropTypes.filter,
  onFilterChanged: PropTypes.func,
};
NotesActiveDaysDisplay = withFilterSelection({
  filtersFilter: NOTES_FILTER_FILTER,
})(NotesActiveDaysDisplay);

NotesActiveDaysDisplay.displayId = 'note-by-active-days';

export const NotesActiveDaysTableDisplay = createDisplay({
  loaderComponent: NotesActiveDaysLoader,
  displayComponent: DataTableDisplay,
  dataTitles: [_l('Active'), _l('# of Notes')],
  dataRow: row => [row.label, row.value],
  dataTransform: transformActiveDaysData,
  title: ({data: tdata}) =>
    _('Notes by Active Days (Total: {{count}})', {count: tdata.total}),
  displayId: 'note-by-active-days-table',
  displayName: 'NotesActiveDaysTableDisplay',
  filtersFilter: NOTES_FILTER_FILTER,
});

registerDisplay(NotesActiveDaysDisplay.displayId, NotesActiveDaysDisplay, {
  title: _l('Chart: Notes by Active Days'),
});

registerDisplay(
  NotesActiveDaysTableDisplay.displayId,
  NotesActiveDaysTableDisplay,
  {
    title: _l('Table: Notes by Active Days'),
  },
);

// vim: set ts=2 sw=2 tw=80:

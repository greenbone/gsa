/* Greenbone Security Assistant
 *
 * Authors:
 * Steffen Waterkamp <steffen.waterkamp@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2018 Greenbone Networks GmbH
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 */

import React from 'react';

import _ from 'gmp/locale';

import FilterTerm from 'gmp/models/filter/filterterm';
import Filter, {OVERRIDES_FILTER_FILTER} from 'gmp/models/filter';

import {parse_float} from 'gmp/parser';

import {is_defined} from 'gmp/utils/identity';

import PropTypes from 'web/utils/proptypes';

import DonutChart from 'web/components/chart/donut3d';
import DataDisplay from 'web/components/dashboard/display/datadisplay';
import DataTableDisplay from 'web/components/dashboard/display/datatabledisplay'; // eslint-disable-line max-len
import withFilterSelection from 'web/components/dashboard/display/withFilterSelection'; // eslint-disable-line max-len
import createDisplay from 'web/components/dashboard/display/createDisplay';
import {
  totalCount,
  percent,
  activeDaysColorScale,
} from 'web/components/dashboard/display/utils';
import {registerDisplay} from 'web/components/dashboard/registry';

import {OverridesActiveDaysLoader} from './loaders';

const MAX_BINS = 10; // if this is changed, activeDaysColorScale needs adjustment

const ACTIVE_YES_ALWAYS_VALUE = '-2';
const ACTIVE_NO_VALUE = '-1';

const transformActiveDaysData = (data = {}) => {
  const {groups = []} = data;
  const sum = totalCount(groups);

  // if more than MAX_BINS groups are loaded, bulk the last ones (those
  // overrides that are active the longest) into one bin
  if (groups.length > MAX_BINS) {
    // cut off array after MAX_BINS
    const mostActiveDaysBin = groups.splice(MAX_BINS - 1);
    // get last value of the shortened group-array, as it is the largest value
    // to be shown separately. The bulked group will be labeled as bigger than
    // this value
    const {value} = groups[groups.length - 1];

    const count = mostActiveDaysBin.reduce((prev, current) =>
      prev + parse_float(current.count), 0);
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
      case ACTIVE_YES_ALWAYS_VALUE:
        label = _('Active (unlimited)');
        break;
      case ACTIVE_NO_VALUE:
        label = _('Inactive');
        break;
      default:
        if (group.bulked) {
          label = _('Active for > {{value}} days', {value});
        }
        else {
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

export class OverridesActiveDaysDisplay extends React.Component {

  constructor(...args) {
    super(...args);

    this.handleDataClick = this.handleDataClick.bind(this);
  }

  handleDataClick(data) {
    const {onFilterChanged, filter} = this.props;
    const {filterValue, bulked = false} = data;

    if (!is_defined(onFilterChanged)) {
      return;
    }

    let activeDaysTerm;
    if (bulked) {
      activeDaysTerm =
        FilterTerm.fromString(`active_days>"${filterValue}"`);
    }
    else {
      activeDaysTerm =
        FilterTerm.fromString(`active_days="${filterValue}"`);
    }

    if (is_defined(filter) && filter.hasTerm(activeDaysTerm)) {
      return;
    }
    const activeDaysFilter = Filter.fromTerm(activeDaysTerm);

    const newFilter = is_defined(filter) ? filter.copy().and(activeDaysFilter) :
      activeDaysFilter;

    onFilterChanged(newFilter);
  }

  render() {
    const {
      filter,
      onFilterChanged,
      ...props
    } = this.props;

    return (
      <OverridesActiveDaysLoader
        filter={filter}
      >
        {loaderProps => (
          <DataDisplay
            {...props}
            {...loaderProps}
            filter={filter}
            dataTransform={transformActiveDaysData}
            title={({data: tdata}) => _('Overrides by Active Days (Total: ' +
              '{{count}})', {count: tdata.total})}
          >
            {({width, height, data: tdata, svgRef}) => (
              <DonutChart
                svgRef={svgRef}
                data={tdata}
                height={height}
                width={width}
                onDataClick={is_defined(onFilterChanged) ?
                  this.handleDataClick : undefined}
              />
            )}
          </DataDisplay>
        )}
      </OverridesActiveDaysLoader>
    );
  }
}

OverridesActiveDaysDisplay.propTypes = {
  filter: PropTypes.filter,
  onFilterChanged: PropTypes.func,
};

OverridesActiveDaysDisplay = withFilterSelection({
  filtersFilter: OVERRIDES_FILTER_FILTER,
})(OverridesActiveDaysDisplay);

OverridesActiveDaysDisplay.displayId = 'override-by-active-days';

export const OverridesActiveDaysTableDisplay = createDisplay({
  loaderComponent: OverridesActiveDaysLoader,
  displayComponent: DataTableDisplay,
  dataRow: row => [row.label, row.value],
  dataTitles: [
    _('Active'),
    _('# of Overrides'),
  ],
  dataTransform: transformActiveDaysData,
  title: ({data: tdata}) => _('Overrides by Active Days (Total: {{count}})',
    {count: tdata.total}),
  displayName: 'OverridesActiveDaysTableDisplay',
  displayId: 'override-by-active-days-table',
  filtersFilter: OVERRIDES_FILTER_FILTER,
});

registerDisplay(OverridesActiveDaysDisplay.displayId,
  OverridesActiveDaysDisplay, {
    title: _('Chart: Overrides by Active Days'),
  },
);

registerDisplay(OverridesActiveDaysTableDisplay.displayId,
  OverridesActiveDaysTableDisplay, {
    title: _('Table: Overrides by Active Days'),
  },
);

// vim: set ts=2 sw=2 tw=80:

/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
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

import moment from 'moment';

import _, {datetime} from 'gmp/locale';

import {parse_int, parse_float} from 'gmp/parser';

import {is_defined} from 'gmp/utils/identity';

import PropTypes from 'web/utils/proptypes';
import Theme from 'web/utils/theme';

import LineChart from 'web/components/chart/line';

import DataDisplay from 'web/components/dashboard2/display/datadisplay';
import {registerDisplay} from 'web/components/dashboard2/registry';

import {ReportsHighResultsLoader} from './loaders';
import FilterTerm from 'gmp/models/filter/filterterm';
import Filter from 'gmp/models/filter';

const transformHighResults = (data = {}) => {
  const {groups = []} = data;
  return groups.map(group => {
    const date = moment(group.value);
    return {
      label: datetime(date),
      x: date,
      y: parse_int(group.stats.high.max),
      y2: parse_float(group.stats.high_per_host.max),
    };
  });
};

export class ReportsHighResultsDisplay extends React.Component {

  constructor(...args) {
    super(...args);

    this.handleRangeSelect = this.handleRangeSelect.bind(this);
  }

  handleRangeSelect(start, end) {

    const {filter, onFilterChanged} = this.props;

    if (!is_defined(onFilterChanged)) {
      return;
    }

    let {x: startDate} = start;
    let {x: endDate} = end;
    const dateFormat = 'YYYY-MM-DDTHH:mm';

    let newFilter = is_defined(filter) ? filter.copy() : new Filter();

    if (is_defined(startDate)) {
      if (startDate.isSame(endDate)) {
        startDate = startDate.clone().subtract(1, 'day');
        endDate = endDate.clone().add(1, 'day');
      }

      const startTerm = FilterTerm.fromString(
        `date>${startDate.format(dateFormat)}`);

      if (!newFilter.hasTerm(startTerm)) {
        newFilter = newFilter.and(Filter.fromTerm(startTerm));
      }
    }

    if (is_defined(endDate)) {
      const endTerm = FilterTerm.fromString(
        `date<${endDate.format(dateFormat)}`);

      if (!newFilter.hasTerm(endTerm)) {
        newFilter = newFilter.and(Filter.fromTerm(endTerm));
      }
    }

    onFilterChanged(newFilter);
  }

  render() {
    const {filter} = this.props;
    return (
      <ReportsHighResultsLoader
        filter={filter}
      >
        {loaderProps => (
          <DataDisplay
            {...this.props}
            {...loaderProps}
            dataTransform={transformHighResults}
            filter={filter}
            title={({data: tdata}) =>
              _('Reports with High Results')}
          >
            {({width, height, data: tdata, svgRef}) => (
              <LineChart
                timeline
                svgRef={svgRef}
                width={width}
                height={height}
                data={tdata}
                yAxisLabel={_('Max High')}
                y2AxisLabel={_('Max High per Host')}
                xAxisLabel={_('Time')}
                yLine={{
                  color: Theme.darkGreen,
                  label: _('Max High'),
                }}
                y2Line={{
                  color: Theme.darkGreen,
                  dashArray: '3, 2',
                  label: _('Max High per Host'),
                }}
                onRangeSelected={this.handleRangeSelect}
              />
            )}
          </DataDisplay>
        )}
      </ReportsHighResultsLoader>
    );
  }
}

ReportsHighResultsDisplay.propTypes = {
  filter: PropTypes.filter,
  onFilterChanged: PropTypes.func,
};

ReportsHighResultsDisplay.displayId = 'report-by-high-results';

registerDisplay(ReportsHighResultsDisplay.displayId,
  ReportsHighResultsDisplay, {
    title: _('Chart: Reports with high Results'),
  },
);


// vim: set ts=2 sw=2 tw=80:

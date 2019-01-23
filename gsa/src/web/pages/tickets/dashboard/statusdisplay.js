/* Copyright (C) 2019 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
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

import {scaleOrdinal} from 'd3-scale';

import {_, _l} from 'gmp/locale/lang';

import Filter, {TICKETS_FILTER_FILTER} from 'gmp/models/filter';
import FilterTerm from 'gmp/models/filter/filterterm';
import {TICKET_STATUS} from 'gmp/models/ticket';

import {isDefined} from 'gmp/utils/identity';

import DonutChart from 'web/components/chart/donut';

import {registerDisplay} from 'web/components/dashboard/registry';

import DataDisplay from 'web/components/dashboard/display/datadisplay';
import {
  renderDonutChartIcons,
} from 'web/components/dashboard/display/datadisplayicons';
import {
  percent,
} from 'web/components/dashboard/display/utils';
import withFilterSelection from 'web/components/dashboard/display/withFilterSelection';  // eslint-disable-line max-len

import PropTypes from 'web/utils/proptypes';
import Theme from 'web/utils/theme';

import {TicketsListLoader} from './loaders';

const taskStatusColorScale = scaleOrdinal()
  .domain([
    TICKET_STATUS.open,
    TICKET_STATUS.solved,
    TICKET_STATUS.closed,
    TICKET_STATUS.confimed,
    TICKET_STATUS.orphaned,
  ])
  .range([
    Theme.warningRed, // open
    '#f0a519', // solved
    Theme.lightGray, // closed
    '#2ca02c', // confirmed
    Theme.darkGray, // orphaned
  ]);

const transformStatusData = (tickets = []) => {
  const groups = {
    [TICKET_STATUS.open]: 0,
    [TICKET_STATUS.solved]: 0,
    [TICKET_STATUS.closed]: 0,
    [TICKET_STATUS.solved]: 0,
    [TICKET_STATUS.confimed]: 0,
    [TICKET_STATUS.orphaned]: 0,
  };

  tickets.reduce((prev, ticket) => {
    const count = prev[ticket.status];
    prev[ticket.status] = count + 1;
    return prev;
  }, groups);

  const tdata = Object.entries(groups).map(([value, count]) => {
    const perc = percent(count, tickets.length);
    return {
      value: count,
      label: value,
      toolTip: `${value}: ${perc}% (${count})`,
      color: taskStatusColorScale(value),
      filterValue: value,
    };
  });

  tdata.total = tickets.length;

  return tdata;
};

export class TicketsStatusDisplay extends React.Component {

  constructor(...args) {
    super(...args);

    this.handleDataClick = this.handleDataClick.bind(this);
  }

  handleDataClick(data) {
    const {onFilterChanged, filter} = this.props;
    const {filterValue} = data;

    if (isDefined(filterValue) && isDefined(onFilterChanged)) {
      const statusTerm = FilterTerm.fromString(`status="${filterValue}"`);

      if (isDefined(filter) && filter.hasTerm(statusTerm)) {
        return;
      }

      const statusFilter = Filter.fromTerm(statusTerm);
      const newFilter = isDefined(filter) ? filter.copy().and(statusFilter) :
        statusFilter;

      onFilterChanged(newFilter);
    }
  }

  render() {
    const {
      filter,
      onFilterChanged,
      ...props
    } = this.props;
    return (
      <TicketsListLoader
        filter={filter}
      >
        {loaderProps => (
          <DataDisplay
            {...props}
            {...loaderProps}
            initialState={{
              show3d: true,
            }}
            filter={filter}
            dataTransform={transformStatusData}
            title={({data: tdata}) =>
              _('Tickets by Status (Total: {{count}})', {count: tdata.total})}
            icons={renderDonutChartIcons}
          >
            {({width, height, data: tdata, svgRef, state}) => (
              <DonutChart
                svgRef={svgRef}
                width={width}
                height={height}
                data={tdata}
                show3d={state.show3d}
                showLegend={state.showLegend}
                onDataClick={isDefined(onFilterChanged) ?
                  this.handleDataClick : undefined}
                onLegendItemClick={isDefined(onFilterChanged) ?
                  this.handleDataClick : undefined}
              />
            )}
          </DataDisplay>
        )}
      </TicketsListLoader>
    );
  }
}

TicketsStatusDisplay.propTypes = {
  filter: PropTypes.filter,
  onFilterChanged: PropTypes.func,
};

TicketsStatusDisplay.displayId = 'tickets-by-status';

TicketsStatusDisplay = withFilterSelection({
  filtersFilter: TICKETS_FILTER_FILTER,
})(TicketsStatusDisplay);

registerDisplay(TicketsStatusDisplay.displayId, TicketsStatusDisplay, {
  title: _l('Chart: Tickets by Status'),
});

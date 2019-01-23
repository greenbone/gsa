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
import {scaleLinear} from 'd3-scale';

import {_, _l} from 'gmp/locale/lang';

import {TICKETS_FILTER_FILTER} from 'gmp/models/filter';

import BubbleChart from 'web/components/chart/bubble';

import DataDisplay from 'web/components/dashboard/display/datadisplay';

import {TicketsListLoader} from './loaders';
import {registerDisplay} from 'web/components/dashboard/registry';
import createDisplay from 'web/components/dashboard/display/createDisplay';

export const assignedUserColorScale = scaleLinear()
  .domain([0, 0.05, 0.25, 0.50, 0.75, 0.95, 1.00])
  .range([
    '#008644',
    '#55B200',
    '#94D800',
    '#E6E600',
    '#EDBA00',
    '#EC6E00',
    '#D63900',
  ]);

const transformUserAssignedData = (tickets = []) => {
  const groups = tickets.reduce((prev, ticket) => {
    const username = ticket.assignedTo.user.name;
    const count = prev[username] || 0;
    prev[username] = count + 1;
    return prev;
  }, {});

  const tdata = Object.entries(groups).map(([value, count]) => {
    return {
      value: count,
      label: value,
      toolTip: `${value}: ${count}`,
      color: assignedUserColorScale(count / tickets.length),
      filterValue: value,
    };
  });

  tdata.total = tickets.length;

  return tdata;
};

export const TicketsAssignedUsersDisplay = createDisplay({
  chartComponent: BubbleChart,
  dataTransform: transformUserAssignedData,
  displayComponent: DataDisplay,
  displayId: 'tickets-by-assigned-users',
  displayName: 'TicketsAssignedUsersDisplay',
  filtersFilter: TICKETS_FILTER_FILTER,
  loaderComponent: TicketsListLoader,
  title: ({data: tdata}) =>
    _('Tickets by Assigned User (Total: {{total}})', tdata),
  showToggleLegend: false,
});

registerDisplay(TicketsAssignedUsersDisplay.displayId,
  TicketsAssignedUsersDisplay, {
    title: _l('Chart: Tickers by Assigned User'),
  });

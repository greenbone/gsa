/* Copyright (C) 2019-2021 Greenbone Networks GmbH
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

import {scaleOrdinal} from 'd3-scale';

import {_, _l} from 'gmp/locale/lang';

import {TICKETS_FILTER_FILTER} from 'gmp/models/filter';
import {TICKET_STATUS, getTranslatableTicketStatus} from 'gmp/models/ticket';

import {registerDisplay} from 'web/components/dashboard/registry';

import createDisplay from 'web/components/dashboard/display/createDisplay';
import DataTableDisplay from 'web/components/dashboard/display/datatabledisplay'; // eslint-disable-line max-len
import {percent} from 'web/components/dashboard/display/utils';

import StatusDisplay from 'web/components/dashboard/display/status/statusdisplay'; // eslint-disable-line max-len

import Theme from 'web/utils/theme';

import {TicketsListLoader} from './loaders';

const ticketStatusColorScale = scaleOrdinal()
  .domain(Object.values(TICKET_STATUS).sort())
  .range([
    Theme.lightGray, // closed
    '#f0a519', // fixed
    '#2ca02c', // fix verified
    Theme.warningRed, // open
  ]);

const transformStatusData = (tickets = []) => {
  const groups = tickets.reduce((prev, ticket) => {
    const count = prev[ticket.status] || 0;
    prev[ticket.status] = count + 1;
    return prev;
  }, {});

  const tdata = Object.entries(groups).map(([value, count]) => {
    const perc = percent(count, tickets.length);
    const label = getTranslatableTicketStatus(value);
    return {
      value: count,
      label,
      toolTip: `${label}: ${perc}% (${count})`,
      color: ticketStatusColorScale(value),
      filterValue: value,
    };
  });

  tdata.total = tickets.length;

  return tdata;
};

export const TicketsStatusDisplay = createDisplay({
  dataTransform: transformStatusData,
  displayComponent: StatusDisplay,
  displayId: 'tickets-by-status',
  title: ({data: tdata}) =>
    _('Tickets by Status (Total: {{count}})', {count: tdata.total}),
  filtersFilter: TICKETS_FILTER_FILTER,
  loaderComponent: TicketsListLoader,
});

export const TicketsStatusTableDisplay = createDisplay({
  dataRow: row => [row.label, row.value],
  dataTitles: [_l('Status'), _l('# of Tickets')],
  dataTransform: transformStatusData,
  displayComponent: DataTableDisplay,
  displayId: 'tickets-by-status-table',
  displayName: 'TicketsStatusTableDisplay',
  filtersFilter: TICKETS_FILTER_FILTER,
  loaderComponent: TicketsListLoader,
  title: ({data: tdata = {}}) =>
    _('Tickets by Status (Total: {{count}})', {count: tdata.total}),
});

registerDisplay(TicketsStatusDisplay.displayId, TicketsStatusDisplay, {
  title: _l('Chart: Tickets by Status'),
});

registerDisplay(
  TicketsStatusTableDisplay.displayId,
  TicketsStatusTableDisplay,
  {
    title: _l('Table: Tickets by Status'),
  },
);

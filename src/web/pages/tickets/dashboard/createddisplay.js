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
import {_, _l} from 'gmp/locale/lang';
import {shortDate} from 'gmp/locale/date';

import date from 'gmp/models/date';
import {TICKETS_FILTER_FILTER} from 'gmp/models/filter';

import createDisplay from 'web/components/dashboard/display/createDisplay';
import DataTableDisplay from 'web/components/dashboard/display/datatabledisplay'; // eslint-disable-line max-len
import {registerDisplay} from 'web/components/dashboard/registry';

import CreatedDisplay from 'web/components/dashboard/display/created/createddisplay'; // eslint-disable-line max-len

import Theme from 'web/utils/theme';

import {TicketsListLoader} from './loaders';

const transfromCreated = (tickets = []) => {
  const dates = tickets.reduce((prev, ticket) => {
    const timestamp = +ticket.creationTime.startOf('day');
    const count = prev[timestamp] || 0;
    prev[timestamp] = count + 1;
    return prev;
  }, {});

  let sum = 0;
  return Object.entries(dates)
    .sort((a, b) => a[0] - b[0]) // sort asc by timestamp
    .map(([timestamp, count]) => {
      sum += count;
      return {
        x: date(+timestamp), // Object.entries returns keys as string => convert to number
        y: count,
        y2: sum,
      };
    });
};

export const TicketsCreatedDisplay = createDisplay({
  dataTransform: transfromCreated,
  displayId: 'tickets-by-created',
  displayName: 'TicketsCreatedDisplay',
  displayComponent: CreatedDisplay,
  filtersFilter: TICKETS_FILTER_FILTER,
  loaderComponent: TicketsListLoader,
  title: () => _('Tickets by Creation Time'),
  yAxisLabel: _l('# of created Tickets'),
  y2AxisLabel: _l('Total Tickets'),
  xAxisLabel: _l('Time'),
  yLine: {
    color: Theme.darkGreenTransparent,
    label: _l('Created Tickets'),
  },
  y2Line: {
    color: Theme.darkGreenTransparent,
    dashArray: '3, 2',
    label: _l('Total Tickets'),
  },
});

export const TicketsCreatedTableDisplay = createDisplay({
  dataRow: row => [row.y, row.y2, shortDate(row.x)],
  dataTitles: [_l('Created Tickets'), _l('Total Tickets'), _l('Time')],
  dataTransform: transfromCreated,
  displayComponent: DataTableDisplay,
  displayId: 'tickets-by-created-table',
  displayName: 'TicketsCreatedTableDisplay',
  filtersFilter: TICKETS_FILTER_FILTER,
  loaderComponent: TicketsListLoader,
  title: ({data: tdata = {}}) =>
    _('Tickets by Creation Time (Total: {{count}})', {count: tdata.total}),
});

registerDisplay(TicketsCreatedDisplay.displayId, TicketsCreatedDisplay, {
  title: _l('Chart: Tickets by Creation Time'),
});

registerDisplay(
  TicketsCreatedTableDisplay.displayId,
  TicketsCreatedTableDisplay,
  {
    title: _l('Table: Tickets by Creation Time'),
  },
);

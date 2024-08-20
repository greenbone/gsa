/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {scaleLinear} from 'd3-scale';

import {_, _l} from 'gmp/locale/lang';

import {TICKETS_FILTER_FILTER} from 'gmp/models/filter';

import BubbleChart from 'web/components/chart/bubble';

import createDisplay from 'web/components/dashboard/display/createDisplay';
import DataDisplay from 'web/components/dashboard/display/datadisplay';
import DataTableDisplay from 'web/components/dashboard/display/datatabledisplay'; // eslint-disable-line max-len

import {registerDisplay} from 'web/components/dashboard/registry';

import {TicketsListLoader} from './loaders';

export const assignedUserColorScale = scaleLinear()
  .domain([0, 0.05, 0.25, 0.5, 0.75, 0.95, 1.0])
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

export const TicketsAssignedUsersTableDisplay = createDisplay({
  dataRow: row => [row.label, row.value],
  dataTitles: [_l('Assigned To'), _l('# of Tickets')],
  dataTransform: transformUserAssignedData,
  displayComponent: DataTableDisplay,
  displayId: 'tickets-by-assigned-users-table',
  displayName: 'TicketsAssignedUsersTableDisplay',
  filtersFilter: TICKETS_FILTER_FILTER,
  loaderComponent: TicketsListLoader,
  title: ({data: tdata = {}}) =>
    _('Tickets by Assigned User (Total: {{total}})', tdata),
});

registerDisplay(
  TicketsAssignedUsersDisplay.displayId,
  TicketsAssignedUsersDisplay,
  {
    title: _l('Chart: Tickets by Assigned User'),
  },
);

registerDisplay(
  TicketsAssignedUsersTableDisplay.displayId,
  TicketsAssignedUsersTableDisplay,
  {
    title: _l('Table: Tickets by Assigned User'),
  },
);

/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {scaleOrdinal} from 'd3-scale';
import {_, _l} from 'gmp/locale/lang';
import {TICKETS_FILTER_FILTER} from 'gmp/models/filter';
import {
  TICKET_STATUS,
  type TicketStatusValue,
  getTranslatableTicketStatus,
} from 'gmp/models/ticket';
import createDisplay from 'web/components/dashboard/display/createDisplay';
import DataTableDisplay from 'web/components/dashboard/display/DataTableDisplay';
import StatusDisplay from 'web/components/dashboard/display/status/StatusDisplay';
import {percent} from 'web/components/dashboard/display/utils';
import {registerDisplay} from 'web/components/dashboard/registry';
import {
  type TicketData,
  TicketsListLoader,
} from 'web/pages/tickets/dashboard/TicketLoaders';
import Theme from 'web/utils/theme';

interface TransformedTicketStatusDataItem {
  value: number;
  label: string;
  toolTip: string;
  color: string;
  filterValue: string;
}

interface TransformedTicketStatusData extends Array<TransformedTicketStatusDataItem> {
  total: number;
}

const ticketStatusColorScale = scaleOrdinal()
  .domain(Object.values(TICKET_STATUS).sort())
  .range([
    Theme.lightGray, // closed
    '#f0a519', // fixed
    '#2ca02c', // fix verified
    Theme.warningRed, // open
  ]);

const transformStatusData = (
  tickets: TicketData = [],
): TransformedTicketStatusData => {
  const groups: Partial<Record<TicketStatusValue, number>> = tickets.reduce(
    (prev, ticket) => {
      const status = ticket.status as TicketStatusValue;
      const count = prev[status] ?? 0;
      prev[status] = count + 1;
      return prev;
    },
    {},
  );

  const transformedData = Object.entries(groups).map(([value, count]) => {
    const perc = percent(count, tickets.length);
    const label = getTranslatableTicketStatus(value as TicketStatusValue);
    return {
      value: count,
      label,
      toolTip: `${label}: ${perc}% (${count})`,
      color: ticketStatusColorScale(value),
      filterValue: value,
    } as TransformedTicketStatusDataItem;
  });

  const result = transformedData as TransformedTicketStatusData;
  result.total = tickets.length;
  return result;
};

export const TicketsStatusDisplay = createDisplay({
  loaderComponent: TicketsListLoader,
  displayComponent: props => (
    <StatusDisplay
      {...props}
      dataTransform={transformStatusData}
      title={({data}) =>
        _('Tickets by Status (Total: {{count}})', {count: data.total})
      }
    />
  ),
  filtersFilter: TICKETS_FILTER_FILTER,
  displayId: 'tickets-by-status',
});

export const TicketsStatusTableDisplay = createDisplay({
  loaderComponent: TicketsListLoader,
  displayComponent: props => (
    <DataTableDisplay
      {...props}
      dataRow={row => [row.label, row.value]}
      dataTitles={[_('Status'), _('# of Tickets')]}
      dataTransform={transformStatusData}
      title={({data}) =>
        _('Tickets by Status (Total: {{count}})', {count: data.total})
      }
    />
  ),
  displayId: 'tickets-by-status-table',
  displayName: 'TicketsStatusTableDisplay',
  filtersFilter: TICKETS_FILTER_FILTER,
});

registerDisplay(TicketsStatusDisplay, _l('Chart: Tickets by Status'));

registerDisplay(TicketsStatusTableDisplay, _l('Table: Tickets by Status'));

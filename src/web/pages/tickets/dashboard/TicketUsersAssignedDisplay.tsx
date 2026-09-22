/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {scaleLinear} from 'd3-scale';
import {_, _l} from 'gmp/locale/lang';
import {TICKETS_FILTER_FILTER} from 'gmp/models/filter';
import {isDefined} from 'gmp/utils/identity';
import DonutChart, {
  type DonutChartProps,
} from 'web/components/chart/DonutChart';
import createDisplay from 'web/components/dashboard/display/createDisplay';
import DataDisplay, {
  type DataDisplayProps,
} from 'web/components/dashboard/display/DataDisplay';
import DataTableDisplay from 'web/components/dashboard/display/DataTableDisplay';
import {registerDisplay} from 'web/components/dashboard/registry';
import {
  type TicketData,
  TicketsListLoader,
} from 'web/pages/tickets/dashboard/TicketLoaders';

interface TransformedTicketUserAssignedDataItem {
  value: number;
  label: string;
  toolTip: string;
  color: string;
  filterValue: string;
}

interface TransformedTicketUserAssignedData extends Array<TransformedTicketUserAssignedDataItem> {
  total: number;
}

export const assignedUserColorScale = scaleLinear<string>()
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

const transformUserAssignedData = (
  tickets: TicketData = [],
): TransformedTicketUserAssignedData => {
  const groups: Record<string, number> = tickets.reduce((prev, ticket) => {
    const username = ticket.assignedTo?.name;
    if (!isDefined(username)) {
      return prev;
    }
    const count = prev[username] ?? 0;
    prev[username] = count + 1;
    return prev;
  }, {});

  const transformedData = Object.entries(groups).map(([value, count]) => {
    return {
      value: count,
      label: value,
      toolTip: `${value}: ${count}`,
      color: assignedUserColorScale(count / tickets.length),
      filterValue: value,
    } as TransformedTicketUserAssignedDataItem;
  });

  const result = transformedData as TransformedTicketUserAssignedData;
  result.total = tickets.length;
  return result;
};

type TicketUserAssignedDataDisplayProps = DataDisplayProps<
  TicketData,
  TransformedTicketUserAssignedData
>;

export const TicketsAssignedUsersDisplay = createDisplay({
  chartComponent: (
    props: DonutChartProps<TransformedTicketUserAssignedDataItem>,
  ) => <DonutChart {...props} showLegend={false} />,
  loaderComponent: TicketsListLoader,
  displayComponent: props => (
    <DataDisplay<
      TicketData,
      TicketUserAssignedDataDisplayProps,
      TransformedTicketUserAssignedData
    >
      {...props}
      dataTransform={transformUserAssignedData}
      showToggleLegend={false}
      title={({data}) =>
        _('Tickets by Assigned User (Total: {{total}})', {total: data.total})
      }
    />
  ),
  displayId: 'tickets-by-assigned-users',
  displayName: 'TicketsAssignedUsersDisplay',
  filtersFilter: TICKETS_FILTER_FILTER,
});

export const TicketsAssignedUsersTableDisplay = createDisplay({
  loaderComponent: TicketsListLoader,
  displayComponent: props => (
    <DataTableDisplay
      {...props}
      dataRow={row => [row.label, row.value]}
      dataTitles={[_l('Assigned To'), _l('# of Tickets')]}
      dataTransform={transformUserAssignedData}
      title={({data}) =>
        _('Tickets by Assigned User (Total: {{total}})', {total: data.total})
      }
    />
  ),
  displayId: 'tickets-by-assigned-users-table',
  displayName: 'TicketsAssignedUsersTableDisplay',
  filtersFilter: TICKETS_FILTER_FILTER,
});

registerDisplay(
  TicketsAssignedUsersDisplay,
  _l('Chart: Tickets by Assigned User'),
);

registerDisplay(
  TicketsAssignedUsersTableDisplay,
  _l('Table: Tickets by Assigned User'),
);

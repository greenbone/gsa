/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {_, _l} from 'gmp/locale/lang';
import date from 'gmp/models/date';
import {TICKETS_FILTER_FILTER} from 'gmp/models/filter';
import {parseInt} from 'gmp/parser';
import {isDefined} from 'gmp/utils/identity';
import {type CreatedDataPoint} from 'web/components/dashboard/display/created/created-transform';
import CreatedDisplay from 'web/components/dashboard/display/created/CreatedDisplay';
import createDisplay from 'web/components/dashboard/display/createDisplay';
import DataTableDisplay from 'web/components/dashboard/display/DataTableDisplay';
import {registerDisplay} from 'web/components/dashboard/registry';
import {
  type TicketData,
  TicketsListLoader,
} from 'web/pages/tickets/dashboard/TicketLoaders';
import Theme from 'web/utils/theme';
import {formattedUserSettingShortDate} from 'web/utils/user-setting-time-date-formatters';

type TransformedTicketCreatedDataItem = CreatedDataPoint;

type TransformedTicketCreatedData = TransformedTicketCreatedDataItem[];

const transformTicketCreated = (
  tickets: TicketData = [],
): TransformedTicketCreatedData => {
  const dates: Record<number, number> = tickets.reduce((prev, ticket) => {
    const timestamp = ticket.creationTime?.startOf('day').unix();
    if (!isDefined(timestamp)) {
      return prev;
    }
    const count = prev[timestamp] || 0;
    prev[timestamp] = count + 1;
    return prev;
  }, {});

  let sum = 0;
  return Object.entries(dates)
    .sort((a, b) => (parseInt(a[0]) as number) - (parseInt(b[0]) as number)) // sort asc by timestamp
    .map(([timestamp, count]) => {
      sum += count;
      return {
        x: date(parseInt(timestamp) as number), // Object.entries returns keys as string => convert to number
        y: count,
        y2: sum,
      } as TransformedTicketCreatedDataItem;
    });
};

export const TicketsCreatedDisplay = createDisplay({
  loaderComponent: TicketsListLoader,
  displayComponent: props => (
    <CreatedDisplay<TicketData, TransformedTicketCreatedData>
      {...props}
      dataTransform={transformTicketCreated}
      title={() => _('Tickets by Creation Time')}
      xAxisLabel={_('Time')}
      y2AxisLabel={_('Total Tickets')}
      y2Line={{
        color: Theme.darkGreenTransparent,
        dashArray: '3, 2',
        label: _('Total Tickets'),
      }}
      yAxisLabel={_('# of created Tickets')}
      yLine={{
        color: Theme.darkGreenTransparent,
        label: _('Created Tickets'),
      }}
    />
  ),
  displayId: 'tickets-by-created',
  displayName: 'TicketsCreatedDisplay',
  filtersFilter: TICKETS_FILTER_FILTER,
});

export const TicketsCreatedTableDisplay = createDisplay({
  loaderComponent: TicketsListLoader,
  displayComponent: props => (
    <DataTableDisplay<TicketData, TransformedTicketCreatedData>
      {...props}
      dataRow={transformedData =>
        transformedData?.map(row => [
          row.y,
          row.y2,
          formattedUserSettingShortDate(row.x) as string,
        ]) ?? []
      }
      dataTitles={[_l('Created Tickets'), _l('Total Tickets'), _l('Time')]}
      dataTransform={transformTicketCreated}
      title={({data}) =>
        _('Tickets by Creation Time (Total: {{count}})', {
          count: data?.length ?? 0,
        })
      }
    />
  ),
  displayId: 'tickets-by-created-table',
  displayName: 'TicketsCreatedTableDisplay',
  filtersFilter: TICKETS_FILTER_FILTER,
});

registerDisplay(TicketsCreatedDisplay, _l('Chart: Tickets by Creation Time'));

registerDisplay(
  TicketsCreatedTableDisplay,
  _l('Table: Tickets by Creation Time'),
);

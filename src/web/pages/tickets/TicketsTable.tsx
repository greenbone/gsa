/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {_l} from 'gmp/locale/lang';
import type Ticket from 'gmp/models/ticket';
import createEntitiesFooter, {
  type CreateEntitiesFooterProps,
} from 'web/entities/createEntitiesFooter';
import createEntitiesTable from 'web/entities/createEntitiesTable';
import withRowDetails from 'web/entities/withRowDetails';
import TicketDetails from 'web/pages/tickets/TicketDetails';
import TicketsHeader, {
  type TicketsHeaderProps,
} from 'web/pages/tickets/TicketsTableHeader';
import TicketsTableRow, {
  type TicketsTableRowProps,
} from 'web/pages/tickets/TicketsTableRow';

const TicketsTable = createEntitiesTable<
  Ticket,
  CreateEntitiesFooterProps<Ticket>,
  TicketsHeaderProps,
  TicketsTableRowProps
>({
  emptyTitle: _l('No tickets available'),
  header: TicketsHeader,
  row: TicketsTableRow,
  rowDetails: withRowDetails<Ticket>('ticket')(TicketDetails),
  footer: createEntitiesFooter({
    download: 'tickets.xml',
    span: 8,
    trash: true,
  }),
});

export default TicketsTable;

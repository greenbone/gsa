/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import EntitiesCommand from 'gmp/commands/entities';
import type Http from 'gmp/http/http';
import {type Element} from 'gmp/models/model';
import Ticket from 'gmp/models/ticket';

class TicketsCommand extends EntitiesCommand<Ticket> {
  constructor(http: Http) {
    super(http, 'ticket', Ticket);
  }

  getEntitiesResponse(root: Element): Element {
    // @ts-expect-error
    return root.get_tickets.get_tickets_response;
  }
}

export default TicketsCommand;

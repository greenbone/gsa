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
import Ticket from '../models/ticket';

import EntitiesCommand from './entities';
import EntityCommand from './entity';

import registerCommand from '../command';

export class TicketCommand extends EntityCommand {

  constructor(http) {
    super(http, 'ticket', Ticket);
  }

  create({
    resultId,
    userId,
    comment,
  }) {
    return this.action({
      cmd: 'create_ticket',
      result_id: resultId,
      user_id: userId,
      comment,
    });
  }

  save({
    id,
    comment,
    status,
    userId,
  }) {
    return this.action({
      cmd: 'save_ticket',
      id,
      comment,
      ticket_status: status,
      user_id: userId,
    });
  }

  getElementFromRoot(root) {
    return root.get_ticket.get_tickets_response.ticket;
  }

}

export class TicketsCommand extends EntitiesCommand {

  constructor(http) {
    super(http, 'ticket', Ticket);
  }

  getEntitiesResponse(root) {
    return root.get_tickets.get_tickets_response;
  }
}

registerCommand('tickets', TicketsCommand);
registerCommand('ticket', TicketCommand);

// vim: set ts=2 sw=2 tw=80:

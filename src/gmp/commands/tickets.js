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
import Ticket from 'gmp/models/ticket';

import EntitiesCommand from './entities';
import EntityCommand from './entity';

import registerCommand from 'gmp/command';
import {isDefined} from 'gmp/utils/identity';

const convertNote = note => {
  if (!isDefined(note)) {
    return note;
  }

  note = note.trim();

  return note;
};

export class TicketCommand extends EntityCommand {
  constructor(http) {
    super(http, 'ticket', Ticket);
  }

  create({resultId, userId, note}) {
    return this.action({
      cmd: 'create_ticket',
      result_id: resultId,
      user_id: userId,
      note: convertNote(note),
    });
  }

  save({id, openNote, fixedNote, closedNote, status, userId}) {
    return this.action({
      cmd: 'save_ticket',
      id,
      open_note: convertNote(openNote),
      fixed_note: convertNote(fixedNote),
      closed_note: convertNote(closedNote),
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

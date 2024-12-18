/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import registerCommand from 'gmp/command';
import Ticket from 'gmp/models/ticket';
import {isDefined} from 'gmp/utils/identity';

import EntitiesCommand from './entities';
import EntityCommand from './entity';

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

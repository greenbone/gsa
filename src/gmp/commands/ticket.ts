/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import EntityCommand from 'gmp/commands/entity';
import type Http from 'gmp/http/http';
import {type Element} from 'gmp/models/model';
import Ticket, {type TicketStatus, type TicketElement} from 'gmp/models/ticket';
import {isDefined} from 'gmp/utils/identity';

interface CreateTicketArguments {
  resultId: string;
  userId: string;
  note?: string;
}

interface SaveTicketArguments {
  id: string;
  openNote?: string;
  fixedNote?: string;
  closedNote?: string;
  status: TicketStatus;
  userId: string;
}

const convertNote = (note?: string) => {
  if (!isDefined(note)) {
    return note;
  }

  note = note.trim();

  return note;
};

class TicketCommand extends EntityCommand<Ticket, TicketElement> {
  constructor(http: Http) {
    super(http, 'ticket', Ticket);
  }

  create({resultId, userId, note}: CreateTicketArguments) {
    return this.action({
      cmd: 'create_ticket',
      result_id: resultId,
      user_id: userId,
      note: convertNote(note),
    });
  }

  save({
    id,
    openNote,
    fixedNote,
    closedNote,
    status,
    userId,
  }: SaveTicketArguments) {
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

  getElementFromRoot(root: Element): TicketElement {
    // @ts-expect-error
    return root.get_ticket.get_tickets_response.ticket;
  }
}

export default TicketCommand;

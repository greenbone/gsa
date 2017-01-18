/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2017 Greenbone Networks GmbH
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

import logger from '../../log.js';

import {EntityCommand, EntitiesCommand, register_command} from '../command.js';

import Note from '../models/note.js';

const log = logger.getLogger('gmp.commands.notes');

export class NoteCommand extends EntityCommand {

  constructor(http) {
    super(http, 'note', Note);
  }

  getElementFromResponse(root) {
    return root.get_note.get_notes_response.note;
  }

  create(args) {
    let {oid, active = '-1', days = 30, hosts = '', hosts_manual = '',
      note_result_id = '', note_result_uuid = '', port = '', port_manual = '',
      severity = '', note_task_id = '', note_task_uuid = '', text} = args;
    log.debug('Creating new note', args);
    return this.httpPost({
      cmd: 'create_note',
      next: 'get_note',
      oid,
      active,
      days,
      hosts,
      hosts_manual,
      note_result_id,
      note_result_uuid,
      note_task_id,
      note_task_uuid,
      port,
      port_manual,
      severity,
      text,
    }).then(xhr => this.getModelFromResponse(xhr));
  }

  save(args) {
    let {note_id, active = '-1', days = 30, hosts = '', note_result_id = '',
      port = '', severity = '', note_task_id = '', text} = args;
    log.debug('Saving note', args);
    return this.httpPost({
      cmd: 'save_note',
      next: 'get_note',
      note_id,
      active,
      days,
      hosts,
      note_result_id,
      note_task_id,
      port,
      severity,
      text,
    }).then(xhr => this.getModelFromResponse(xhr));
  }
}

export class NotesCommand extends EntitiesCommand {

  constructor(http) {
    super(http, 'note', Note);
  }

  getEntitiesResponse(root) {
    return root.get_notes.get_notes_response;
  }
};

register_command('note', NoteCommand);
register_command('notes', NotesCommand);

// vim: set ts=2 sw=2 tw=80:

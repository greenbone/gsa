/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2017 - 2018 Greenbone Networks GmbH
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

import logger from '../log.js';

import {EntityCommand, EntitiesCommand, register_command} from '../command.js';

import Note from '../models/note.js';
import {
  DEFAULT_DAYS,
  ACTIVE_YES_ALWAYS_VALUE,
  ANY,
  MANUAL,
} from '../models/override.js';

const log = logger.getLogger('gmp.commands.notes');

class NoteCommand extends EntityCommand {

  constructor(http) {
    super(http, 'note', Note);
  }

  getElementFromRoot(root) {
    return root.get_note.get_notes_response.note;
  }

  create(args) {
    return this._save({cmd: 'create_note', ...args});
  }

  save(args) {
    return this._save({cmd: 'save_note', ...args});
  }

  _save(args) {
    const {
      cmd,
      oid,
      id,
      active = ACTIVE_YES_ALWAYS_VALUE,
      days = DEFAULT_DAYS,
      hosts = ANY,
      hosts_manual = '',
      result_id = '',
      result_uuid = '',
      port = ANY,
      port_manual = '',
      severity = '',
      task_id = '',
      task_uuid = '',
      text,
    } = args;
    log.debug('Saving note', args);
    return this.action({
      cmd,
      oid,
      id,
      active,
      days,
      hosts: hosts === MANUAL ? '--' : '',
      hosts_manual,
      result_id,
      result_uuid,
      task_id,
      task_uuid,
      port: port === MANUAL ? '--' : '',
      port_manual,
      severity,
      text,
    });
  }
}

class NotesCommand extends EntitiesCommand {

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

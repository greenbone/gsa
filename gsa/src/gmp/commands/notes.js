/* Copyright (C) 2017-2019 Greenbone Networks GmbH
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
import logger from '../log';

import registerCommand from '../command';

import Note from '../models/note';
import {
  DEFAULT_DAYS,
  ACTIVE_YES_ALWAYS_VALUE,
  ANY,
  MANUAL,
} from '../models/override';

import EntitiesCommand from './entities';
import EntityCommand from './entity';

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
    this.setParam('details', 1);
  }

  getEntitiesResponse(root) {
    return root.get_notes.get_notes_response;
  }

  getActiveDaysAggregates({filter} = {}) {
    return this.getAggregates({
      aggregate_type: 'note',
      group_column: 'active_days',
      filter,
      maxGroups: 250,
    });
  }

  getCreatedAggregates({filter} = {}) {
    return this.getAggregates({
      aggregate_type: 'note',
      group_column: 'created',
      aggregate_mode: 'count',
      filter,
    });
  }

  getWordCountsAggregates({filter} = {}) {
    return this.getAggregates({
      aggregate_type: 'note',
      group_column: 'text',
      aggregate_mode: 'word_counts',
      filter,
    });
  }
}

registerCommand('note', NoteCommand);
registerCommand('notes', NotesCommand);

// vim: set ts=2 sw=2 tw=80:

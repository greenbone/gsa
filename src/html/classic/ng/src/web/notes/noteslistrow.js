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

import React from 'react';

import _ from '../../locale.js';
import {shorten} from '../../utils.js';

import LegacyLink from '../legacylink.js';

import EntityRow from '../entities/row.js';

import NoteDialog from './dialog.js';

export class NotesListRow extends EntityRow {

  constructor(props) {
    super('note', props);

    this.state = {
      note: this.props.note,
    };
  }

  renderEditDialog() {
    let note = this.getEntity();
    return (
      <NoteDialog note={note} ref={ref => this.edit_dialog = ref}
        title={_('Edit note {{note}}', {note: shorten(note.text)})}
        onSave={this.onSave}/>
    );
  }

  render() {
    let note = this.getEntity();
    return (
      <tr>
        <td>
          <LegacyLink cmd="get_note" note_id={note.id}>
            {note.isOrphan() &&
              <div><b>{_('Orphan')}</b></div>
            }
            {shorten(note.text)}
          </LegacyLink>
        </td>
        <td>
          {note.nvt ? note.nvt.name : ""}
        </td>
        <td>
          {note.isActive() ? _('yes') : _('no')}
        </td>
        {this.renderTableActions()}
      </tr>
    );
  }
}

NotesListRow.contextTypes = {
  gmp: React.PropTypes.object.isRequired,
  capabilities: React.PropTypes.object.isRequired,
};

NotesListRow.propTypes = {
  note: React.PropTypes.object.isRequired,
};

export default NotesListRow;

// vim: set ts=2 sw=2 tw=80:

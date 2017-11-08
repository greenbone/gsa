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

import _ from 'gmp/locale.js';
import {is_defined, is_empty, shorten} from 'gmp/utils.js';

import PropTypes from '../../utils/proptypes.js';

import Wrapper from '../../components/layout/wrapper.js';

import EntityComponent from '../../entity/component.js';

import NoteDialog from './dialog.js';

class NoteComponent extends React.Component {

  constructor(...args) {
    super(...args);

    this.openNoteDialog = this.openNoteDialog.bind(this);
    this.openCreateNoteDialog = this.openCreateNoteDialog.bind(this);
  }

  openNoteDialog(note) {
    if (is_defined(note)) {
      let active = '0';
      if (note.isActive()) {
        if (is_empty(note.end_time)) {
          active = '-1';
        }
        else {
          active = '-2';
        }
      }
      this.note_dialog.show({
        id: note.id,
        active,
        hosts: is_defined(note.hosts) ? '--' : '',
        hosts_manual: note.hosts,
        port: note.port,
        oid: is_defined(note.nvt) ? note.nvt.oid : undefined,
        note,
        note_id: note.id,
        nvt: note.nvt,
        note_severity: note.severity,
        task_id: is_defined(note.task) && is_defined(note.task.id) ? '0' : '',
        task_uuid: is_defined(note.task) ? note.task.id : '',
        result_id: is_defined(note.result) && is_defined(note.result.id) ?
          '0' : '',
        result_uuid: is_defined(note.result) ? note.result.id : '',
        severity: note.severity,
        text: note.text,
      }, {
        title: _('Edit Note {{name}}', {name: shorten(note.text, 20)}),
      });

      this.loadTasks();
    }
  }

  openCreateNoteDialog(initial = {}) {
    this.note_dialog.show(initial);

    this.loadTasks();
  }

  loadTasks() {
    const {gmp} = this.context;

    gmp.tasks.getAll().then(tasks =>
        this.note_dialog.setValue('tasks', tasks));
  }

  render() {
    const {
      children,
      onCloned,
      onCloneError,
      onCreated,
      onCreateError,
      onDeleted,
      onDeleteError,
      onDownloaded,
      onDownloadError,
      onSaved,
      onSaveError,
    } = this.props;

    return (
      <EntityComponent
        name="note"
        onCreated={onCreated}
        onCreateError={onCreateError}
        onCloned={onCloned}
        onCloneError={onCloneError}
        onDeleted={onDeleted}
        onDeleteError={onDeleteError}
        onDownloaded={onDownloaded}
        onDownloadError={onDownloadError}
        onSaved={onSaved}
        onSaveError={onSaveError}
      >
        {({
          save,
          ...other
        }) => (
          <Wrapper>
            {children({
              ...other,
              create: this.openCreateNoteDialog,
              edit: this.openNoteDialog,
            })}
            <NoteDialog
              ref={ref => this.note_dialog = ref}
              onSave={save}
            />
          </Wrapper>
        )}
      </EntityComponent>
    );
  }
}

NoteComponent.propTypes = {
  children: PropTypes.func.isRequired,
  onCloneError: PropTypes.func,
  onCloned: PropTypes.func,
  onCreateError: PropTypes.func,
  onCreated: PropTypes.func,
  onDeleteError: PropTypes.func,
  onDeleted: PropTypes.func,
  onDownloadError: PropTypes.func,
  onDownloaded: PropTypes.func,
  onSaveError: PropTypes.func,
  onSaved: PropTypes.func,
};

NoteComponent.contextTypes = {
  gmp: PropTypes.gmp.isRequired,
};

export default NoteComponent;

// vim: set ts=2 sw=2 tw=80:

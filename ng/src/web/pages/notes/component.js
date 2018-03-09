/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 * Steffen Waterkamp <steffen.waterkamp@greenbone.net>
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

import React from 'react';

import _ from 'gmp/locale';
import {
  is_array,
  is_defined,
  is_empty,
  shorten,
} from 'gmp/utils';

import PropTypes from '../../utils/proptypes';

import Wrapper from '../../components/layout/wrapper';

import EntityComponent from '../../entity/component';

import NoteDialog, {
  ACTIVE_NO_VALUE,
  ACTIVE_YES_ALWAYS_VALUE,
  ACTIVE_YES_UNTIL_VALUE,
} from './dialog';

class NoteComponent extends React.Component {

  constructor(...args) {
    super(...args);

    this.state = {dialogVisible: false};

    this.closeNoteDialog = this.closeNoteDialog.bind(this);
    this.openNoteDialog = this.openNoteDialog.bind(this);
    this.openCreateNoteDialog = this.openCreateNoteDialog.bind(this);
  }

  openNoteDialog(note, initial) {
    if (is_defined(note)) {
      let active = ACTIVE_NO_VALUE;
      if (note.isActive()) {
        if (is_empty(note.end_time)) {
          active = ACTIVE_YES_ALWAYS_VALUE;
        }
        else {
          active = ACTIVE_YES_UNTIL_VALUE;
        }
      }
      this.setState({
        dialogVisible: true,
        id: note.id,
        active,
        hosts: is_defined(note.hosts) && note.hosts.length > 0 ? '--' : '',
        hosts_manual: is_array(note.hosts) ? note.hosts.join(', ') : '',
        port: note.port,
        oid: is_defined(note.nvt) ? note.nvt.oid : undefined,
        note,
        note_id: note.id,
        nvt: note.nvt,
        note_severity: note.severity,
        task_id: is_defined(note.task) && note.task.id.length > 0 ? '0' : '',
        task_uuid: is_defined(note.task) ? note.task.id : '',
        result_id: is_defined(note.result) && note.result.id.length > 0 ?
          '0' : '',
        result_uuid: is_defined(note.result) ? note.result.id : '',
        severity: note.severity,
        text: note.text,
        title: _('Edit Note {{name}}', {name: shorten(note.text, 20)}),
      });
    }
    else {
      this.setState({
        dialogVisible: true,
        active: undefined,
        hosts: undefined,
        hosts_manual: [],
        port: undefined,
        note: undefined,
        result_id: undefined,
        result_uuid: undefined,
        severity: undefined,
        task_id: undefined,
        task_name: undefined,
        task_uuid: undefined,
        text: undefined,
        title: undefined,
        ...initial,
      });
    }
    this.loadTasks();
  }

  closeNoteDialog() {
    this.setState({dialogVisible: false});
  }

  openCreateNoteDialog(initial = {}) {
    this.openNoteDialog(undefined, initial);
  }

  loadTasks() {
    const {gmp} = this.context;

    gmp.tasks.getAll().then(response => {
      this.setState({tasks: response.data});
    });
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

    const {
      dialogVisible,
      active,
      hosts,
      hosts_manual,
      id,
      oid,
      note,
      note_id,
      note_severity,
      nvt,
      port,
      result_id,
      result_uuid,
      severity,
      task_id,
      task_uuid,
      tasks,
      text,
      title,
      ...initial
    } = this.state;

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
              visible={dialogVisible}
              active={active}
              hosts={hosts}
              hosts_manual={hosts_manual}
              id={id}
              oid={oid}
              note={note}
              note_id={note_id}
              note_severity={note_severity}
              nvt={nvt}
              port={port}
              result_id={result_id}
              result_uuid={result_uuid}
              severity={severity}
              task_id={task_id}
              task_uuid={task_uuid}
              tasks={tasks}
              text={text}
              title={title}
              onClose={this.closeNoteDialog}
              onSave={save}
              {...initial}
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

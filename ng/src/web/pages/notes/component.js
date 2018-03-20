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

import {
  ACTIVE_NO_VALUE,
  ACTIVE_YES_ALWAYS_VALUE,
  ACTIVE_YES_UNTIL_VALUE,
  TASK_SELECTED,
  TASK_ANY,
  RESULT_UUID,
  RESULT_ANY,
  MANUAL,
  ANY,
} from 'gmp/models/override';

import PropTypes from '../../utils/proptypes';
import withGmp from '../../utils/withGmp';

import Wrapper from '../../components/layout/wrapper';

import EntityComponent from '../../entity/component';

import NoteDialog from './dialog';
import {has_id} from 'gmp/utils/id';

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

      const {hosts, nvt, task, result, port} = note;

      this.setState({
        dialogVisible: true,
        id: note.id,
        active,
        hosts: is_defined(hosts) && hosts.length > 0 ? MANUAL : ANY,
        hosts_manual: is_array(hosts) ? hosts.join(', ') : undefined,
        port: is_defined(port) ? MANUAL : ANY,
        port_manual: port,
        oid: is_defined(nvt) ? nvt.oid : undefined,
        note,
        nvt_name: is_defined(nvt) ? nvt.name : undefined,
        task_id: has_id(task) ? TASK_SELECTED : TASK_ANY,
        task_uuid: has_id(task) ? task.id : undefined,
        result_id: has_id(result) ? RESULT_UUID : RESULT_ANY,
        result_uuid: has_id(result) ? result.id : undefined,
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
        hosts_manual: undefined,
        id: undefined,
        note: undefined,
        nvt_name: undefined,
        oid: undefined,
        port: undefined,
        port_manual: undefined,
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
    const {gmp} = this.props;

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
      nvt_name,
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
              nvt_name={nvt_name}
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
  gmp: PropTypes.gmp.isRequired,
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

export default withGmp(NoteComponent);

// vim: set ts=2 sw=2 tw=80:

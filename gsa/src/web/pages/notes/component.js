/* Copyright (C) 2017-2021 Greenbone Networks GmbH
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

import React, {useReducer} from 'react';

import _ from 'gmp/locale';

import {ALL_FILTER} from 'gmp/models/filter';

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

import {hasId} from 'gmp/utils/id';
import {isDefined, isArray} from 'gmp/utils/identity';
import {shorten} from 'gmp/utils/string';

import EntityComponent from 'web/entity/component';

import {useCreateNote, useModifyNote} from 'web/graphql/notes';
import {useLazyGetTasks} from 'web/graphql/tasks';

import PropTypes from 'web/utils/proptypes';
import reducer, {updateState} from 'web/utils/stateReducer';

import NoteDialog from './dialog';

const NoteComponent = ({
  children,
  onCloned,
  onCloneError,
  onCreated,
  onCreateError,
  onDeleted,
  onDeleteError,
  onDownloaded,
  onDownloadError,
  onInteraction,
  onSaved,
  onSaveError,
}) => {
  const [state, dispatch] = useReducer(reducer, {dialogVisible: false});
  const [createNote] = useCreateNote();
  const [modifyNote] = useModifyNote();

  const openNoteDialog = (note, initial) => {
    if (isDefined(note)) {
      let active = ACTIVE_NO_VALUE;
      if (note.isActive()) {
        if (isDefined(note.endTime)) {
          active = ACTIVE_YES_UNTIL_VALUE;
        } else {
          active = ACTIVE_YES_ALWAYS_VALUE;
        }
      }

      const {hosts, nvt, task, result, port} = note;

      dispatch(
        updateState({
          dialogVisible: true,
          id: note.id,
          active,
          hosts: isDefined(hosts) && hosts.length > 0 ? MANUAL : ANY,
          hosts_manual: isArray(hosts) ? hosts.join(', ') : undefined,
          port: isDefined(port) ? MANUAL : ANY,
          port_manual: port,
          oid: isDefined(nvt) ? nvt.oid : undefined,
          note,
          nvt_name: isDefined(nvt) ? nvt.name : undefined,
          task_id: hasId(task) ? TASK_SELECTED : TASK_ANY,
          task_uuid: hasId(task) ? task.id : undefined,
          result_id: hasId(result) ? RESULT_UUID : RESULT_ANY,
          result_uuid: hasId(result) ? result.id : undefined,
          severity: note.severity,
          text: note.text,
          title: _('Edit Note {{name}}', {name: shorten(note.text, 20)}),
        }),
      );
    } else {
      dispatch(
        updateState({
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
        }),
      );
    }

    handleInteraction();
    loadTasks();
  };

  const closeNoteDialog = () => {
    dispatch(updateState({dialogVisible: false}));
  };

  const handleCloseNoteDialog = () => {
    closeNoteDialog();
    handleInteraction();
  };

  const openCreateNoteDialog = (initial = {}) => {
    openNoteDialog(undefined, initial);
  };

  const [loadTasks, {tasks}] = useLazyGetTasks({
    filterString: ALL_FILTER.toFilterString(),
  });

  const handleSaveNote = data => {
    handleInteraction();

    const {id, ...other} = data;

    if (isDefined(id)) {
      return modifyNote(data)
        .then(onSaved, onSaveError)
        .then(() => closeNoteDialog());
    }

    return createNote(other)
      .then(onCreated, onCreateError)
      .then(() => closeNoteDialog());
  };

  const handleInteraction = () => {
    if (isDefined(onInteraction)) {
      onInteraction();
    }
  };

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
    text,
    title,
    ...initial
  } = state;

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
      onInteraction={onInteraction}
      onSaved={onSaved}
      onSaveError={onSaveError}
    >
      {({save, ...other}) => (
        <React.Fragment>
          {children({
            ...other,
            create: openCreateNoteDialog,
            edit: openNoteDialog,
          })}
          {dialogVisible && (
            <NoteDialog
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
              onClose={handleCloseNoteDialog}
              onSave={handleSaveNote}
              {...initial}
            />
          )}
        </React.Fragment>
      )}
    </EntityComponent>
  );
};

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
  onInteraction: PropTypes.func.isRequired,
  onSaveError: PropTypes.func,
  onSaved: PropTypes.func,
};

export default NoteComponent;

// vim: set ts=2 sw=2 tw=80:

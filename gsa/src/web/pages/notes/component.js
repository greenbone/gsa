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
  DEFAULT_OID_VALUE,
  TASK_SELECTED,
  TASK_ANY,
  RESULT_UUID,
  RESULT_ANY,
  MANUAL,
  ANY,
} from 'gmp/models/override';

import {parseInt} from 'gmp/parser';

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
  const [state, dispatchState] = useReducer(reducer, {dialogVisible: false});
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

      dispatchState(
        updateState({
          dialogVisible: true,
          id: note.id,
          active,
          hosts: isDefined(hosts) && hosts.length > 0 ? MANUAL : ANY,
          hostsManual: isArray(hosts) ? hosts.join(',') : undefined,
          port: isDefined(port) ? MANUAL : ANY,
          portManual: port,
          nvtId: isDefined(nvt) ? nvt.nvtId : undefined,
          note,
          nvtName: isDefined(nvt) ? nvt.name : undefined,
          taskId: hasId(task) ? TASK_SELECTED : TASK_ANY,
          taskUuid: hasId(task) ? task.id : undefined,
          resultId: hasId(result) ? RESULT_UUID : RESULT_ANY,
          resultUuid: hasId(result) ? result.id : undefined,
          severity: note.severity,
          text: note.text,
          title: _('Edit Note {{name}}', {name: shorten(note.text, 20)}),
        }),
      );
    } else {
      dispatchState(
        updateState({
          dialogVisible: true,
          active: undefined,
          hosts: undefined,
          hostsManual: undefined,
          id: undefined,
          note: undefined,
          nvtName: undefined,
          nvtId: undefined,
          port: undefined,
          portManual: undefined,
          resultId: undefined,
          resultUuid: undefined,
          severity: undefined,
          taskId: undefined,
          taskName: undefined,
          taskUuid: undefined,
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
    dispatchState(updateState({dialogVisible: false}));
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

    const {
      active,
      days,
      hostsManual,
      id,
      portManual,
      severity,
      resultUuid,
      taskUuid,
      text,
    } = data;

    let daysActive;
    if (active === ACTIVE_YES_UNTIL_VALUE) {
      daysActive = days;
    } else {
      daysActive = parseInt(active);
    }

    const modifyData = {
      id,
      severity,
      daysActive,
      hosts: hostsManual.split(','),
      port: portManual,
      taskId: taskUuid,
      resultId: resultUuid,
      text,
    };

    if (isDefined(id)) {
      return modifyNote(modifyData)
        .then(onSaved, onSaveError)
        .then(() => closeNoteDialog());
    }

    const createData = {
      ...modifyData,
      nvtOid: isDefined(data?.nvtId) ? data.nvtId : DEFAULT_OID_VALUE,
      id: undefined,
    };

    return createNote(createData)
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
    hostsManual,
    id,
    nvtId,
    note,
    nvtName,
    port,
    resultId,
    resultUuid,
    severity,
    taskId,
    taskUuid,
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
              hostsManual={hostsManual}
              id={id}
              nvtId={nvtId}
              note={note}
              nvtName={nvtName}
              port={port}
              resultId={resultId}
              resultUuid={resultUuid}
              severity={severity}
              taskId={taskId}
              taskUuid={taskUuid}
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

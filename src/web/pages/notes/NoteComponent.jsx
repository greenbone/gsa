/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

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
import {useState} from 'react';
import EntityComponent from 'web/entity/EntityComponent';
import useGmp from 'web/hooks/useGmp';
import useTranslation from 'web/hooks/useTranslation';
import NoteDialog from 'web/pages/notes/Dialog';
import PropTypes from 'web/utils/PropTypes';

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
  ...props
}) => {
  const gmp = useGmp();
  const [_] = useTranslation();

  const [dialogVisible, setDialogVisible] = useState(false);
  const [active, setActive] = useState();
  const [hosts, setHosts] = useState();
  const [hostsManual, setHostsManual] = useState();
  const [id, setId] = useState();
  const [note, setNote] = useState();
  const [nvtName, setNvtName] = useState();
  const [oid, setOid] = useState();
  const [port, setPort] = useState();
  const [portManual, setPortManual] = useState();
  const [resultId, setResultId] = useState();
  const [resultUuid, setResultUuid] = useState();
  const [severity, setSeverity] = useState();
  const [taskId, setTaskId] = useState();
  const [taskUuid, setTaskUuid] = useState();
  const [tasks, setTasks] = useState();
  const [text, setText] = useState();
  const [title, setTitle] = useState();

  const handleInteraction = () => {
    if (isDefined(onInteraction)) {
      onInteraction();
    }
  };

  const closeNoteDialog = () => {
    setDialogVisible(false);
  };

  const handleCloseNoteDialog = () => {
    closeNoteDialog();
    handleInteraction();
  };

  const loadTasks = () => {
    gmp.tasks.getAll().then(response => {
      setTasks(response.data);
    });
  };

  const openNoteDialog = (note, initial = {}) => {
    if (isDefined(note)) {
      let activeValue = ACTIVE_NO_VALUE;
      if (note.isActive()) {
        if (isDefined(note.endTime)) {
          activeValue = ACTIVE_YES_UNTIL_VALUE;
        } else {
          activeValue = ACTIVE_YES_ALWAYS_VALUE;
        }
      }

      const {hosts, nvt, task, result, port} = note;

      setDialogVisible(true);
      setId(note.id);
      setActive(activeValue);
      setHosts(isDefined(hosts) && hosts.length > 0 ? MANUAL : ANY);
      setHostsManual(isArray(hosts) ? hosts.join(', ') : undefined);
      setPort(isDefined(port) ? MANUAL : ANY);
      setPortManual(port);
      setOid(isDefined(nvt) ? nvt.oid : undefined);
      setNote(note);
      setNvtName(isDefined(nvt) ? nvt.name : undefined);
      setTaskId(hasId(task) ? TASK_SELECTED : TASK_ANY);
      setTaskUuid(hasId(task) ? task.id : undefined);
      setResultId(hasId(result) ? RESULT_UUID : RESULT_ANY);
      setResultUuid(hasId(result) ? result.id : undefined);
      setSeverity(note.severity);
      setText(note.text);
      setTitle(_('Edit Note {{name}}', {name: shorten(note.text, 20)}));
    } else {
      setDialogVisible(true);
      setActive(undefined);
      setHosts(undefined);
      setHostsManual(undefined);
      setId(undefined);
      setNote(undefined);
      setNvtName(undefined);
      setOid(undefined);
      setPort(undefined);
      setPortManual(undefined);
      setResultId(undefined);
      setResultUuid(undefined);
      setSeverity(undefined);
      setTaskId(undefined);
      setTaskUuid(undefined);
      setText(undefined);
      setTitle(undefined);
    }

    handleInteraction();
    loadTasks();
  };

  const openCreateNoteDialog = (initial = {}) => {
    openNoteDialog(undefined, initial);
  };

  // Create an initial object with any other state variables
  const initial = {};

  return (
    <EntityComponent
      name="note"
      onCloneError={onCloneError}
      onCloned={onCloned}
      onCreateError={onCreateError}
      onCreated={onCreated}
      onDeleteError={onDeleteError}
      onDeleted={onDeleted}
      onDownloadError={onDownloadError}
      onDownloaded={onDownloaded}
      onInteraction={onInteraction}
      onSaveError={onSaveError}
      onSaved={onSaved}
    >
      {({save, ...other}) => (
        <>
          {children({
            ...other,
            create: openCreateNoteDialog,
            edit: openNoteDialog,
          })}
          {dialogVisible && (
            <NoteDialog
              active={active}
              hosts={hosts}
              hosts_manual={hostsManual}
              id={id}
              note={note}
              nvt_name={nvtName}
              oid={oid}
              port={port}
              port_manual={portManual}
              result_id={resultId}
              result_uuid={resultUuid}
              severity={severity}
              task_id={taskId}
              task_uuid={taskUuid}
              tasks={tasks}
              text={text}
              title={title}
              onClose={handleCloseNoteDialog}
              onSave={d => {
                handleInteraction();
                return save(d).then(() => closeNoteDialog());
              }}
              {...initial}
            />
          )}
        </>
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

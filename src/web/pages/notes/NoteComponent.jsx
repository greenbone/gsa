/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useState} from 'react';
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
  const [fixed, setFixed] = useState(false);
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
  const [resultName, setResultName] = useState();
  const [severity, setSeverity] = useState();
  const [taskId, setTaskId] = useState();
  const [taskName, setTaskName] = useState();
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
    const {fixed = false} = initial;
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
      setFixed(fixed);
      setHosts(isDefined(hosts) && hosts.length > 0 ? MANUAL : ANY);
      setHostsManual(isArray(hosts) ? hosts.join(', ') : undefined);
      setPort(isDefined(port) ? MANUAL : ANY);
      setPortManual(port);
      setOid(isDefined(nvt) ? nvt.oid : undefined);
      setNote(note);
      setNvtName(isDefined(nvt) ? nvt.name : undefined);
      setTaskId(hasId(task) ? TASK_SELECTED : TASK_ANY);
      setTaskName(hasId(task) ? task.name : undefined);
      setTaskUuid(hasId(task) ? task.id : undefined);
      setResultId(hasId(result) ? RESULT_UUID : RESULT_ANY);
      setResultName(hasId(result) ? result.name : undefined);
      setResultUuid(hasId(result) ? result.id : undefined);
      setSeverity(note.severity);
      setText(note.text);
      setTitle(_('Edit Note {{name}}', {name: shorten(note.text, 20)}));
    } else {
      setDialogVisible(true);
      setActive(initial.active);
      setFixed(initial.fixed);
      setHosts(initial.hosts);
      setHostsManual(initial.hosts_manual);
      setId(initial.id);
      setNote(initial.note);
      setNvtName(initial.nvt_name);
      setOid(initial.oid);
      setPort(initial.port);
      setPortManual(initial.port_manual);
      setResultId(initial.result_id);
      setResultName(initial.result_name);
      setResultUuid(initial.result_uuid);
      setSeverity(initial.severity);
      setTaskId(initial.task_id);
      setTaskName(initial.task_name);
      setTaskUuid(initial.task_uuid);
      setText(initial.text);
      setTitle(initial.title);
    }

    handleInteraction();
    loadTasks();
  };

  const openCreateNoteDialog = (initial = {}) => {
    openNoteDialog(undefined, initial);
  };

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
              fixed={fixed}
              hosts={hosts}
              hosts_manual={hostsManual}
              id={id}
              note={note}
              nvt_name={nvtName}
              oid={oid}
              port={port}
              port_manual={portManual}
              result_id={resultId}
              result_name={resultName}
              result_uuid={resultUuid}
              severity={severity}
              task_id={taskId}
              task_name={taskName}
              task_uuid={taskUuid}
              tasks={tasks}
              text={text}
              title={title}
              onClose={handleCloseNoteDialog}
              onSave={d => {
                handleInteraction();
                return save(d).then(() => closeNoteDialog());
              }}
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
  onInteraction: PropTypes.func,
  onSaveError: PropTypes.func,
  onSaved: PropTypes.func,
};

export default NoteComponent;

/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useState} from 'react';
import {
  ACTIVE_NO_VALUE,
  ACTIVE_YES_ALWAYS_VALUE,
  ACTIVE_YES_UNTIL_VALUE,
  MANUAL,
  ANY,
} from 'gmp/models/override';
import {hasId} from 'gmp/utils/id';
import {isDefined, isArray} from 'gmp/utils/identity';
import {shorten} from 'gmp/utils/string';
import EntityComponent from 'web/entity/EntityComponent';
import useGmp from 'web/hooks/useGmp';
import useTranslation from 'web/hooks/useTranslation';
import NoteDialog from 'web/pages/notes/NoteDialog';
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

  const closeNoteDialog = () => {
    setDialogVisible(false);
  };

  const handleCloseNoteDialog = () => {
    closeNoteDialog();
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
      setTaskId(hasId(task) ? MANUAL : ANY);
      setTaskName(hasId(task) ? task.name : undefined);
      setTaskUuid(hasId(task) ? task.id : undefined);
      setResultId(hasId(result) ? MANUAL : ANY);
      setResultName(hasId(result) ? result.name : undefined);
      setResultUuid(hasId(result) ? result.id : undefined);
      setSeverity(note.severity);
      setText(note.text);
      setTitle(_('Edit Note {{- name}}', {name: shorten(note.text, 20)}));
    } else {
      setDialogVisible(true);
      setActive(initial.active);
      setFixed(initial.fixed);
      setHosts(initial.hosts);
      setHostsManual(initial.hostsManual);
      setId(initial.id);
      setNote(initial.note);
      setNvtName(initial.nvtName);
      setOid(initial.oid);
      setPort(initial.port);
      setPortManual(initial.portManual);
      setResultId(initial.resultId);
      setResultName(initial.resultName);
      setResultUuid(initial.resultUuid);
      setSeverity(initial.severity);
      setTaskId(initial.taskId);
      setTaskName(initial.taskName);
      setTaskUuid(initial.taskUuid);
      setText(initial.text);
      setTitle(initial.title);
    }

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
      onSaveError={onSaveError}
      onSaved={onSaved}
    >
      {({save, create, ...other}) => (
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
              hostsManual={hostsManual}
              id={id}
              note={note}
              nvtName={nvtName}
              oid={oid}
              port={port}
              portManual={portManual}
              resultId={resultId}
              resultName={resultName}
              resultUuid={resultUuid}
              severity={severity}
              taskId={taskId}
              taskName={taskName}
              taskUuid={taskUuid}
              tasks={tasks}
              text={text}
              title={title}
              onClose={handleCloseNoteDialog}
              onSave={d => {
                const promise = isDefined(d.id) ? save(d) : create(d);
                return promise.then(() => closeNoteDialog());
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
  onSaveError: PropTypes.func,
  onSaved: PropTypes.func,
};

export default NoteComponent;

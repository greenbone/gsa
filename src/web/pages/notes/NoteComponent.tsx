/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useState} from 'react';
import type Note from 'gmp/models/note';
import {
  ACTIVE_NO_VALUE,
  ACTIVE_YES_ALWAYS_VALUE,
  ACTIVE_YES_UNTIL_VALUE,
  MANUAL,
  ANY,
  type Active,
  type AnyOrManual,
} from 'gmp/models/override';
import type Task from 'gmp/models/task';
import {hasId} from 'gmp/utils/id';
import {isDefined, isArray} from 'gmp/utils/identity';
import {shorten} from 'gmp/utils/string';
import EntityComponent from 'web/entity/EntityComponent';
import {type EntityCloneResponse} from 'web/entity/hooks/useEntityClone';
import {type EntityCreateResponse} from 'web/entity/hooks/useEntityCreate';
import {type OnDownloadedFunc} from 'web/entity/hooks/useEntityDownload';
import useGmp from 'web/hooks/useGmp';
import useTranslation from 'web/hooks/useTranslation';
import NoteDialog from 'web/pages/notes/NoteDialog';

interface NoteInitialData {
  active?: Active;
  fixed?: boolean;
  hosts?: AnyOrManual;
  hostsManual?: string;
  id?: string;
  note?: Note;
  nvtName?: string;
  oid?: string;
  port?: AnyOrManual;
  portManual?: string;
  resultId?: AnyOrManual;
  resultName?: string;
  resultUuid?: string;
  severity?: number;
  taskId?: AnyOrManual;
  taskName?: string;
  taskUuid?: string;
  text?: string;
  title?: string;
}
interface NoteComponentRenderProps {
  clone: (note: Note) => Promise<void>;
  create: (initial?: NoteInitialData) => void;
  delete: (note: Note) => Promise<void>;
  download: (note: Note) => Promise<void>;
  edit: (note: Note, initial?: NoteInitialData) => void;
}

interface NoteComponentProps {
  children: (props: NoteComponentRenderProps) => React.ReactNode;
  onCloneError?: (error: Error) => void;
  onCloned?: (data: EntityCloneResponse) => void;
  onCreateError?: (error: Error) => void;
  onCreated?: (data: EntityCreateResponse) => void;
  onDeleteError?: (error: Error) => void;
  onDeleted?: () => void;
  onDownloadError?: (error: Error) => void;
  onDownloaded?: OnDownloadedFunc;
  onSaveError?: (error: Error) => void;
  onSaved?: () => void;
}

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
}: NoteComponentProps) => {
  const gmp = useGmp();
  const [_] = useTranslation();

  const [dialogVisible, setDialogVisible] = useState(false);
  const [fixed, setFixed] = useState(false);
  const [active, setActive] = useState<Active | undefined>(undefined);
  const [hosts, setHosts] = useState<AnyOrManual | undefined>(undefined);
  const [hostsManual, setHostsManual] = useState<string | undefined>(undefined);
  const [id, setId] = useState<string | undefined>(undefined);
  const [note, setNote] = useState<Note | undefined>(undefined);
  const [nvtName, setNvtName] = useState<string | undefined>(undefined);
  const [oid, setOid] = useState<string | undefined>(undefined);
  const [port, setPort] = useState<AnyOrManual | undefined>(undefined);
  const [portManual, setPortManual] = useState<string | undefined>(undefined);
  const [resultId, setResultId] = useState<AnyOrManual | undefined>(undefined);
  const [resultUuid, setResultUuid] = useState<string | undefined>(undefined);
  const [resultName, setResultName] = useState<string | undefined>(undefined);
  const [severity, setSeverity] = useState<number | undefined>(undefined);
  const [taskId, setTaskId] = useState<AnyOrManual | undefined>(undefined);
  const [taskName, setTaskName] = useState<string | undefined>(undefined);
  const [taskUuid, setTaskUuid] = useState<string | undefined>(undefined);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [text, setText] = useState<string | undefined>(undefined);
  const [title, setTitle] = useState<string | undefined>(undefined);

  const closeNoteDialog = () => {
    setDialogVisible(false);
  };

  const handleCloseNoteDialog = () => {
    closeNoteDialog();
  };

  const loadTasks = async () => {
    const response = await gmp.tasks.getAll();
    setTasks(response.data);
  };

  const openNoteDialog = (
    note: Note | undefined,
    initial: NoteInitialData = {},
  ) => {
    const {fixed = false} = initial;
    if (isDefined(note)) {
      let activeValue: Active = ACTIVE_NO_VALUE;
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
      setTaskName(hasId(task) ? task?.name : undefined);
      setTaskUuid(hasId(task) ? task?.id : undefined);
      setResultId(hasId(result) ? MANUAL : ANY);
      setResultName(hasId(result) ? result?.name : undefined);
      setResultUuid(hasId(result) ? result?.id : undefined);
      setSeverity(note.severity);
      setText(note.text);
      setTitle(_('Edit Note {{- name}}', {name: shorten(note.text, 20)}));
    } else {
      setDialogVisible(true);
      setActive(initial.active);
      setFixed(initial.fixed ?? false);
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

    void loadTasks();
  };

  const openCreateNoteDialog = (initial: NoteInitialData = {}) => {
    openNoteDialog(undefined, initial);
  };

  return (
    <EntityComponent<Note>
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
              onSave={async d => {
                const promise = isDefined(d.id) ? save(d) : create(d);
                await promise;
                return closeNoteDialog();
              }}
            />
          )}
        </>
      )}
    </EntityComponent>
  );
};

export default NoteComponent;

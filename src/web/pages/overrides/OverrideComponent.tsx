/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useState} from 'react';
import {
  type default as Override,
  type Active,
  type AnyOrManual,
  ANY,
  MANUAL,
  ACTIVE_NO_VALUE,
  ACTIVE_YES_ALWAYS_VALUE,
  ACTIVE_YES_UNTIL_VALUE,
} from 'gmp/models/override';
import type Task from 'gmp/models/task';
import {hasId} from 'gmp/utils/id';
import {isDefined} from 'gmp/utils/identity';
import {shorten} from 'gmp/utils/string';
import EntityComponent from 'web/entity/EntityComponent';
import {type EntityCloneResponse} from 'web/entity/hooks/useEntityClone';
import {type EntityCreateResponse} from 'web/entity/hooks/useEntityCreate';
import {type OnDownloadedFunc} from 'web/entity/hooks/useEntityDownload';
import useGmp from 'web/hooks/useGmp';
import useTranslation from 'web/hooks/useTranslation';
import OverrideDialog from 'web/pages/overrides/OverrideDialog';
import {
  FALSE_POSITIVE_VALUE,
  LOG_VALUE,
  MEDIUM_VALUE,
  LOW_VALUE,
  getSeverityLevelBoundaries,
} from 'web/utils/severity';

interface OverrideComponentInitialData {
  active?: Active;
  customSeverity?: boolean;
  hostsManual?: string;
  hosts?: AnyOrManual;
  id?: string;
  newSeverityFromList?: number;
  newSeverity?: number;
  nvtName?: string;
  oid?: string;
  override?: Override;
  portManual?: string;
  port?: AnyOrManual;
  resultId?: AnyOrManual;
  resultName?: string;
  resultUuid?: string;
  severity?: number;
  taskId?: AnyOrManual;
  taskUuid?: string;
  text?: string;
  title?: string;
}

interface OverrideComponentRenderProps {
  clone: (override: Override) => Promise<void>;
  create: (initial?: OverrideComponentInitialData) => void;
  delete: (override: Override) => Promise<void>;
  download: (override: Override) => Promise<void>;
  edit: (override: Override, initial?: OverrideComponentInitialData) => void;
}

interface OverrideComponentProps {
  children: (props: OverrideComponentRenderProps) => React.ReactNode;
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
const OverrideComponent = ({
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
}: OverrideComponentProps) => {
  const gmp = useGmp();
  const [_] = useTranslation();

  const severityBoundaries = getSeverityLevelBoundaries(
    gmp.settings.severityRating,
  );

  const SEVERITIES_LIST = new Set([
    ...(severityBoundaries.minCritical ? [severityBoundaries.minCritical] : []),
    severityBoundaries.minHigh,
    MEDIUM_VALUE,
    LOW_VALUE,
    LOG_VALUE,
    FALSE_POSITIVE_VALUE,
  ]);

  const [dialogVisible, setDialogVisible] = useState(false);

  const [override, setOverride] = useState<Override | undefined>();
  const [id, setId] = useState<string | undefined>();
  const [active, setActive] = useState<Active | undefined>();

  const [severity, setSeverity] = useState<number | undefined>();
  const [newSeverity, setNewSeverity] = useState<number | undefined>();
  const [newSeverityFromList, setNewSeverityFromList] = useState<
    number | undefined
  >();
  const [customSeverity, setCustomSeverity] = useState<boolean>(false);

  const [hosts, setHosts] = useState<AnyOrManual | undefined>();
  const [hostsManual, setHostsManual] = useState<string | undefined>();

  const [port, setPort] = useState<AnyOrManual | undefined>();
  const [portManual, setPortManual] = useState<string | undefined>();

  const [nvtName, setNvtName] = useState<string | undefined>();
  const [oid, setOid] = useState<string | undefined>();

  const [resultId, setResultId] = useState<AnyOrManual | undefined>();
  const [resultName, setResultName] = useState<string | undefined>();
  const [resultUuid, setResultUuid] = useState<string | undefined>();

  const [taskId, setTaskId] = useState<AnyOrManual | undefined>();
  const [taskUuid, setTaskUuid] = useState<string | undefined>();
  const [tasks, setTasks] = useState<Task[]>([]);

  const [text, setText] = useState<string | undefined>();
  const [title, setTitle] = useState<string | undefined>();

  const [initialProps, setInitialProps] =
    useState<OverrideComponentInitialData>({});

  const loadTasks = async () => {
    const response = await gmp.tasks.getAll();
    setTasks(response.data);
  };

  const closeOverrideDialog = () => {
    setDialogVisible(false);
  };

  const handleCloseOverrideDialog = () => {
    closeOverrideDialog();
  };

  const openOverrideDialog = (
    overrideEntity: Override | undefined,
    initial: OverrideComponentInitialData = {},
  ) => {
    if (isDefined(overrideEntity)) {
      let activeValue: Active = ACTIVE_NO_VALUE;
      if (overrideEntity.isActive()) {
        if (isDefined(overrideEntity.endTime)) {
          activeValue = ACTIVE_YES_UNTIL_VALUE;
        } else {
          activeValue = ACTIVE_YES_ALWAYS_VALUE;
        }
      }

      let customSeverityValue: boolean = false;
      let newSeverityFromListValue: number | undefined;
      let newSeverityValue: number | undefined;

      if (SEVERITIES_LIST.has(overrideEntity.newSeverity as number)) {
        newSeverityFromListValue = overrideEntity.newSeverity as number;
      } else {
        customSeverityValue = true;
        newSeverityValue = overrideEntity.newSeverity as number;
      }

      const {result, task, nvt, hosts: overrideHosts} = overrideEntity;

      setDialogVisible(true);
      setId(overrideEntity.id);
      setActive(activeValue);
      setCustomSeverity(customSeverityValue);
      setHosts(
        isDefined(overrideHosts) && overrideHosts.length > 0 ? MANUAL : ANY,
      );
      setHostsManual(overrideHosts?.join(', '));
      setNewSeverity(newSeverityValue);
      setNewSeverityFromList(newSeverityFromListValue);
      setNvtName(isDefined(nvt) ? nvt.name : undefined);
      setOid(isDefined(nvt) ? nvt.oid : undefined);
      setOverride(overrideEntity);
      setPort(isDefined(overrideEntity.port) ? MANUAL : ANY);
      setPortManual(overrideEntity.port);
      setResultId(hasId(result) ? MANUAL : ANY);
      setResultName(hasId(result) ? result?.name : undefined);
      setResultUuid(hasId(result) ? result?.id : undefined);
      setSeverity(overrideEntity.severity);
      setTaskId(hasId(task) ? MANUAL : ANY);
      setTaskUuid(hasId(task) ? task?.id : undefined);
      setText(overrideEntity.text);
      setTitle(
        _('Edit Override {{- name}}', {
          name: shorten(overrideEntity.text, 20),
        }),
      );
      setInitialProps({});
    } else {
      setDialogVisible(true);
      setActive(undefined);
      setCustomSeverity(false);
      setHosts(undefined);
      setHostsManual(undefined);
      setId(undefined);
      setNewSeverity(undefined);
      setNewSeverityFromList(undefined);
      setNvtName(undefined);
      setOid(undefined);
      setOverride(undefined);
      setPort(undefined);
      setPortManual(undefined);
      setResultId(undefined);
      setResultName(undefined);
      setResultUuid(undefined);
      setSeverity(undefined);
      setTaskId(undefined);
      setTaskUuid(undefined);
      setText(undefined);
      setTitle(undefined);
      setInitialProps(initial);
    }

    void loadTasks();
  };

  const openCreateOverrideDialog = (initial = {}) => {
    openOverrideDialog(undefined, initial);
  };

  return (
    <EntityComponent
      name="override"
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
            create: openCreateOverrideDialog,
            edit: openOverrideDialog,
          })}
          {dialogVisible && (
            <OverrideDialog
              active={active}
              customSeverity={customSeverity}
              hosts={hosts}
              hostsManual={hostsManual}
              id={id}
              newSeverity={newSeverity}
              newSeverityFromList={newSeverityFromList}
              nvtName={nvtName}
              oid={oid}
              override={override}
              port={port}
              portManual={portManual}
              resultId={resultId}
              resultName={resultName}
              resultUuid={resultUuid}
              severity={severity}
              taskId={taskId}
              taskUuid={taskUuid}
              tasks={tasks}
              text={text}
              title={title}
              {...initialProps}
              onClose={handleCloseOverrideDialog}
              onSave={async d => {
                const promise = isDefined(d.id) ? save(d) : create(d);
                await promise;
                return closeOverrideDialog();
              }}
            />
          )}
        </>
      )}
    </EntityComponent>
  );
};

export default OverrideComponent;

/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React, {useState} from 'react';
import {
  ANY,
  MANUAL,
  TASK_ANY,
  TASK_SELECTED,
  RESULT_ANY,
  RESULT_UUID,
  ACTIVE_NO_VALUE,
  ACTIVE_YES_ALWAYS_VALUE,
  ACTIVE_YES_UNTIL_VALUE,
} from 'gmp/models/override';
import {NO_VALUE, YES_VALUE} from 'gmp/parser';
import {hasId} from 'gmp/utils/id';
import {isDefined} from 'gmp/utils/identity';
import {shorten} from 'gmp/utils/string';
import EntityComponent from 'web/entity/EntityComponent';
import useGmp from 'web/hooks/useGmp';
import useTranslation from 'web/hooks/useTranslation';
import OverrideDialog from 'web/pages/overrides/Dialog';
import PropTypes from 'web/utils/PropTypes';
import {
  FALSE_POSITIVE_VALUE,
  LOG_VALUE,
  HIGH_VALUE,
  MEDIUM_VALUE,
  LOW_VALUE,
} from 'web/utils/severity';

const SEVERITIES_LIST = [
  HIGH_VALUE,
  MEDIUM_VALUE,
  LOW_VALUE,
  LOG_VALUE,
  FALSE_POSITIVE_VALUE,
];

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
}) => {
  const gmp = useGmp();
  const [_] = useTranslation();

  const [dialogVisible, setDialogVisible] = useState(false);

  const [override, setOverride] = useState();
  const [id, setId] = useState();
  const [active, setActive] = useState();

  const [severity, setSeverity] = useState();
  const [newSeverity, setNewSeverity] = useState();
  const [newSeverityFromList, setNewSeverityFromList] = useState();
  const [customSeverity, setCustomSeverity] = useState();

  const [hosts, setHosts] = useState();
  const [hostsManual, setHostsManual] = useState();

  const [port, setPort] = useState();
  const [portManual, setPortManual] = useState();

  const [nvtName, setNvtName] = useState();
  const [oid, setOid] = useState();

  const [resultId, setResultId] = useState();
  const [resultName, setResultName] = useState();
  const [resultUuid, setResultUuid] = useState();

  const [taskId, setTaskId] = useState();
  const [taskUuid, setTaskUuid] = useState();
  const [tasks, setTasks] = useState();

  const [text, setText] = useState();
  const [title, setTitle] = useState();

  const [initialProps, setInitialProps] = useState({});

  const loadTasks = () => {
    gmp.tasks.getAll().then(response => setTasks(response.data));
  };

  const closeOverrideDialog = () => {
    setDialogVisible(false);
  };

  const handleCloseOverrideDialog = () => {
    closeOverrideDialog();
  };

  const openOverrideDialog = (overrideEntity, initial = {}) => {
    if (isDefined(overrideEntity)) {
      let activeValue = ACTIVE_NO_VALUE;
      if (overrideEntity.isActive()) {
        if (isDefined(overrideEntity.endTime)) {
          activeValue = ACTIVE_YES_UNTIL_VALUE;
        } else {
          activeValue = ACTIVE_YES_ALWAYS_VALUE;
        }
      }

      let customSeverityValue = NO_VALUE;
      let newSeverityFromListValue;
      let newSeverityValue;

      if (SEVERITIES_LIST.includes(overrideEntity.newSeverity)) {
        newSeverityFromListValue = overrideEntity.newSeverity;
      } else {
        customSeverityValue = YES_VALUE;
        newSeverityValue = overrideEntity.newSeverity;
      }

      const {result, task, nvt, hosts: overrideHosts} = overrideEntity;

      setDialogVisible(true);
      setId(overrideEntity.id);
      setActive(activeValue);
      setCustomSeverity(customSeverityValue);
      setHosts(overrideHosts.length > 0 ? MANUAL : ANY);
      setHostsManual(overrideHosts.join(', '));
      setNewSeverity(newSeverityValue);
      setNewSeverityFromList(newSeverityFromListValue);
      setNvtName(isDefined(nvt) ? nvt.name : undefined);
      setOid(isDefined(nvt) ? nvt.oid : undefined);
      setOverride(overrideEntity);
      setPort(isDefined(overrideEntity.port) ? MANUAL : ANY);
      setPortManual(overrideEntity.port);
      setResultId(hasId(result) ? RESULT_UUID : RESULT_ANY);
      setResultName(hasId(result) ? result.name : undefined);
      setResultUuid(hasId(result) ? result.id : undefined);
      setSeverity(overrideEntity.severity);
      setTaskId(hasId(task) ? TASK_SELECTED : TASK_ANY);
      setTaskUuid(hasId(task) ? task.id : undefined);
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
      setCustomSeverity(undefined);
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

    loadTasks();
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
              custom_severity={customSeverity}
              hosts={hosts}
              hosts_manual={hostsManual}
              id={id}
              newSeverity={newSeverity}
              new_severity_from_list={newSeverityFromList}
              nvt_name={nvtName}
              oid={oid}
              override={override}
              port={port}
              port_manual={portManual}
              result_id={resultId}
              result_name={resultName}
              result_uuid={resultUuid}
              severity={severity}
              task_id={taskId}
              task_uuid={taskUuid}
              tasks={tasks}
              text={text}
              title={title}
              onClose={handleCloseOverrideDialog}
              onSave={d => {
                const promise = isDefined(d.id) ? save(d) : create(d);
                return promise.then(() => closeOverrideDialog());
              }}
              {...initialProps}
            />
          )}
        </>
      )}
    </EntityComponent>
  );
};

OverrideComponent.propTypes = {
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

export default OverrideComponent;

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
/* eslint-disable no-shadow */

import React, {useEffect, useCallback, useReducer} from 'react';

import {useSelector, useDispatch} from 'react-redux';

import _ from 'gmp/locale';

import logger from 'gmp/log';

import date from 'gmp/models/date';
import {ALL_FILTER} from 'gmp/models/filter';
import {FULL_AND_FAST_SCAN_CONFIG_ID} from 'gmp/models/scanconfig';
import {OPENVAS_DEFAULT_SCANNER_ID} from 'gmp/models/scanner';
import {TASK_STATUS} from 'gmp/models/task';

import {NO_VALUE} from 'gmp/parser';

import {map} from 'gmp/utils/array';
import {isDefined} from 'gmp/utils/identity';
import {selectSaveId, hasId} from 'gmp/utils/id';

import EntityComponent from 'web/entity/component';

import {useLazyGetAlerts} from 'web/graphql/alerts';

import {useLazyGetCredentials} from 'web/graphql/credentials';

import {useLazyGetScanners} from 'web/graphql/scanners';

import {useLazyGetScanConfigs} from 'web/graphql/scanconfigs';

import {useLazyGetSchedules} from 'web/graphql/schedules';

import {useLazyGetTargets} from 'web/graphql/targets';

import {
  useModifyTask,
  useCreateContainerTask,
  useCreateTask,
  useStartTask,
  useStopTask,
  useResumeTask,
} from 'web/graphql/tasks';

import {
  useRunQuickFirstScan,
  useRunModifyTask,
  useRunQuickTask,
} from 'web/graphql/wizards';

import ImportReportDialog from 'web/pages/reports/importdialog';

import ScheduleComponent from 'web/pages/schedules/component';
import AlertComponent from 'web/pages/alerts/component';
import TargetComponent from 'web/pages/targets/component';

import {
  loadEntities as loadTagsAction,
  selector as tagsSelector,
} from 'web/store/entities/tags';

import {getTimezone} from 'web/store/usersettings/selectors';

import {loadUserSettingDefaults as loadUserSettingsDefaultsAction} from 'web/store/usersettings/defaults/actions';
import {getUserSettingsDefaults} from 'web/store/usersettings/defaults/selectors';

import stateReducer, {updateState} from 'web/utils/stateReducer';
import PropTypes from 'web/utils/proptypes';
import useGmp from 'web/utils/useGmp';
import {UNSET_VALUE} from 'web/utils/render';
import useCapabilities from 'web/utils/useCapabilities';

import AdvancedTaskWizard from 'web/wizard/advancedtaskwizard';
import ModifyTaskWizard from 'web/wizard/modifytaskwizard';
import TaskWizard from 'web/wizard/taskwizard';

import TaskDialog from './dialog';
import ContainerTaskDialog from './containerdialog';

const log = logger.getLogger('web.pages.tasks.component');

const TAGS_FILTER = ALL_FILTER.copy().set('resource_type', 'task');

const TaskComponent = ({
  children,
  onAdvancedTaskWizardError,
  onAdvancedTaskWizardSaved,
  onCloneError,
  onCloned,
  onContainerCreateError,
  onContainerCreated,
  onContainerSaveError,
  onContainerSaved,
  onCreateError,
  onCreated,
  onDeleteError,
  onDeleted,
  onDownloadError,
  onDownloaded,
  onInteraction,
  onModifyTaskWizardError,
  onModifyTaskWizardSaved,
  onReportImportError,
  onReportImported,
  onResumeError,
  onResumed,
  onSaveError,
  onSaved,
  onStartError,
  onStarted,
  onStopError,
  onStopped,
  onTaskWizardError,
  onTaskWizardSaved,
}) => {
  // GMP and Redux
  const gmp = useGmp();
  const dispatch = useDispatch();

  // Loaders
  const loadTags = useCallback(
    () => dispatch(loadTagsAction(gmp)(TAGS_FILTER)),
    [gmp, dispatch],
  );

  const loadUserSettingsDefaults = useCallback(
    () => dispatch(loadUserSettingsDefaultsAction(gmp)()),
    [dispatch, gmp],
  );

  // Selectors
  const tagsSel = useSelector(tagsSelector);
  const userDefaults = useSelector(getUserSettingsDefaults);

  const timezone = useSelector(getTimezone);
  const defaultAlertId = userDefaults.getValueByName('defaultalert');
  const defaultEsxiCredential = userDefaults.getValueByName(
    'defaultesxicredential',
  );
  const defaultPortListId = userDefaults.getValueByName('defaultportlist');
  const defaultScanConfigId = userDefaults.getValueByName(
    'defaultopenvasscanconfig',
  );
  const defaultScannerId = userDefaults.getValueByName('defaultopenvasscanner');
  const defaultScheduleId = userDefaults.getValueByName('defaultschedule');
  const defaultSshCredential = userDefaults.getValueByName(
    'defaultsshcredential',
  );
  const defaultSmbCredential = userDefaults.getValueByName(
    'defaultsmbcredential',
  );
  const defaultTargetId = userDefaults.getValueByName('defaulttarget');
  const isLoadingTags = tagsSel.isLoadingAllEntities(ALL_FILTER);
  const tags = tagsSel.getEntities(TAGS_FILTER);
  const capabilities = useCapabilities();

  // GraphQL Queries and Mutations
  const [modifyTask] = useModifyTask();
  const [createTask] = useCreateTask();
  const [createContainerTask] = useCreateContainerTask();
  const [startTask] = useStartTask();
  const [stopTask] = useStopTask();
  const [resumeTask] = useResumeTask();
  const [runQuickFirstScan] = useRunQuickFirstScan();
  const [runModifyTask] = useRunModifyTask();
  const [runQuickTask] = useRunQuickTask();

  // GraphQL Loaders and Data
  const [
    loadAlerts,
    {
      alerts,
      loading: isLoadingAlerts,
      refetch: refetchAlerts,
      error: alertError,
    },
  ] = useLazyGetAlerts({
    filterString: ALL_FILTER.toFilterString(),
  });

  const [
    loadCredentials,
    {credentials, error: credentialError},
  ] = useLazyGetCredentials({
    filterString: ALL_FILTER.toFilterString(),
  });

  const [
    loadScanners,
    {scanners, loading: isLoadingScanners, error: scannerError},
  ] = useLazyGetScanners({
    filterString: ALL_FILTER.toFilterString(),
  });

  const [
    loadScanConfigs,
    {scanConfigs, loading: isLoadingConfigs, error: scanConfigError},
  ] = useLazyGetScanConfigs({
    filterString: ALL_FILTER.toFilterString(),
  });

  const [
    loadSchedules,
    {
      schedules,
      loading: isLoadingSchedules,
      error: scheduleError,
      refetch: refetchSchedules,
    },
  ] = useLazyGetSchedules({
    filterString: ALL_FILTER.toFilterString(),
  });

  const [
    loadTargets,
    {
      targets,
      loading: isLoadingTargets,
      refetch: refetchTargets,
      error: targetError,
    },
  ] = useLazyGetTargets({
    filterString: ALL_FILTER.toFilterString(),
  });

  // Component states
  const [state, dispatchState] = useReducer(stateReducer, {
    advancedTaskWizardVisible: false,
    containerTaskDialogVisible: false,
    modifyTaskWizardVisible: false,
    taskDialogVisible: false,
    taskWizardVisible: false,
    reportImportDialogVisible: false,
    targetId: UNSET_VALUE,
    alertIds: [],
    scannerId: UNSET_VALUE,
    scheduleId: UNSET_VALUE,
    configId: defaultScanConfigId,
    tagId: undefined,
    scanConfigs: undefined,
  });

  useEffect(() => {
    loadUserSettingsDefaults();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const handleInteraction = () => {
    if (isDefined(onInteraction)) {
      onInteraction();
    }
  };

  // Handlers
  const handleTargetChange = targetId => {
    dispatchState(updateState({targetId}));
  };

  const handleAlertsChange = alertIds => {
    dispatchState(updateState({alertIds}));
  };

  const handleScheduleChange = scheduleId => {
    dispatchState(updateState({scheduleId}));
  };

  const handleTaskStart = task => {
    handleInteraction();

    return startTask(task.id).then(onStarted, onStartError);
  };

  const handleTaskStop = task => {
    handleInteraction();

    return stopTask(task.id).then(onStopped, onStopError);
  };

  const handleTaskResume = task => {
    handleInteraction();

    return resumeTask(task.id).then(onResumed, onResumeError);
  };

  const closeTaskWizard = () => {
    dispatchState(updateState({taskWizardVisible: false}));
  };

  const handleTaskWizardNewClick = () => {
    openTaskDialog();
    closeTaskWizard();
  };

  const handleAlertCreated = () => {
    refetchAlerts();
  };

  const handleScheduleCreated = scheduleId => {
    refetchSchedules();
    dispatchState(updateState({scheduleId}));
  };

  const handleTargetCreated = targetId => {
    refetchTargets();

    dispatchState(updateState({targetId}));
  };

  const openContainerTaskDialog = inputTask => {
    dispatchState(
      updateState({
        containerTaskDialogVisible: true,
        task: inputTask,
        name: inputTask ? inputTask.name : _('Unnamed'),
        comment: inputTask ? inputTask.comment : '',
        id: inputTask ? inputTask.id : undefined,
        inAssets: inputTask ? inputTask.inAssets : undefined,
        autoDelete: inputTask ? inputTask.autoDelete : undefined,
        autoDeleteData: inputTask ? inputTask.autoDeleteData : undefined,
        title: inputTask
          ? _('Edit Container Task {{name}}', inputTask)
          : _('New Container Task'),
      }),
    );

    handleInteraction();
  };

  const closeContainerTaskDialog = () => {
    dispatchState(updateState({containerTaskDialogVisible: false}));
  };

  const handleCloseContainerTaskDialog = () => {
    closeContainerTaskDialog();
    handleInteraction();
  };

  const handleSaveContainerTask = data => {
    handleInteraction();

    if (isDefined(data.id)) {
      return modifyTask({
        id: data.id,
        name: data.name,
        comment: data.comment,
      })
        .then(onContainerSaved, onContainerSaveError)
        .then(() => closeContainerTaskDialog());
    }
    return createContainerTask({name: data.name, comment: data.comment})
      .then(result => onContainerCreated(result), onContainerCreateError) // queries return a promise and result is what gets returned by django
      .then(() => closeContainerTaskDialog());
  };

  const handleSaveTask = ({
    add_tag,
    alert_ids,
    alterable,
    auto_delete,
    auto_delete_data,
    apply_overrides,
    comment,
    config_id,
    hosts_ordering,
    id,
    in_assets,
    min_qod,
    max_checks,
    max_hosts,
    name,
    scanner_id,
    scanner_type,
    schedule_id,
    schedule_periods,
    source_iface,
    tag_id,
    target_id,
    task,
  }) => {
    handleInteraction();

    if (isDefined(id)) {
      // save edit part
      if (isDefined(task) && !task.isChangeable()) {
        // arguments need to be undefined if the task is not changeable

        dispatchState(
          updateState({
            targetId: undefined,
            scannerId: undefined,
            configId: undefined,
          }),
        );
      }

      const statusIsNew = task.status === TASK_STATUS.new;

      const mutationData = {
        alertIds: alert_ids,
        alterable,
        applyOverrides: apply_overrides,
        autoDelete: auto_delete,
        autoDeleteData: auto_delete_data,
        comment,
        configId: statusIsNew ? config_id : undefined,
        hostsOrdering: hosts_ordering,
        inAssets: in_assets,
        maxChecks: max_checks,
        maxHosts: max_hosts,
        minQod: min_qod,
        name,
        scannerId: statusIsNew ? scanner_id : undefined,
        scannerType: statusIsNew ? scanner_type : undefined,
        scheduleId: schedule_id,
        schedulePeriods: schedule_periods,
        sourceIface: source_iface,
        targetId: target_id,
        id,
      };

      return modifyTask(mutationData)
        .then(onSaved, onSaveError)
        .then(() => closeTaskDialog());
    }
    const mutationData = {
      alertIds: alert_ids,
      alterable,
      applyOverrides: apply_overrides,
      autoDelete: auto_delete,
      autoDeleteData: auto_delete_data,
      comment,
      configId: config_id,
      hostsOrdering: hosts_ordering,
      inAssets: in_assets,
      maxChecks: max_checks,
      maxHosts: max_hosts,
      minQod: min_qod,
      name,
      scannerId: scanner_id,
      scannerType: scanner_type,
      scheduleId: schedule_id,
      schedulePeriods: schedule_periods,
      sourceIface: source_iface,
      targetId: target_id,
    };
    return createTask(mutationData)
      .then(result => onCreated(result), onCreateError)
      .then(() => closeTaskDialog());
  };

  const openTaskDialog = task => {
    if (isDefined(task) && task.isContainer()) {
      openContainerTaskDialog(task);
    } else {
      openStandardTaskDialog(task);
    }
  };

  const closeTaskDialog = () => {
    dispatchState(updateState({taskDialogVisible: false}));
  };

  const handleCloseTaskDialog = () => {
    closeTaskDialog();
    handleInteraction();
  };

  const openStandardTaskDialog = task => {
    loadAlerts();
    loadScanConfigs();
    loadScanners();
    loadSchedules();
    loadTargets();
    loadTags();

    if (isDefined(task)) {
      const canAccessSchedules =
        capabilities.mayAccess('schedules') && isDefined(task.schedule);
      const scheduleId = canAccessSchedules ? task.schedule.id : UNSET_VALUE;
      const schedulePeriods = canAccessSchedules
        ? task.schedulePeriods
        : undefined;

      dispatchState(
        updateState({
          taskDialogVisible: true,
          error: undefined, // remove old errors
          minQod: task.minQod,
          sourceIface: task.sourceIface,
          schedulePeriods,
          scannerId: hasId(task.scanner) ? task.scanner.id : undefined,
          name: task.name,
          scheduleId,
          target_id: hasId(task.target) ? task.target.id : undefined,
          alertIds: map(task.alerts, alert => alert.id),
          alterable: task.alterable,
          applyOverrides: task.applyOverrides,
          autoDelete: task.autoDelete,
          autoDeleteData: task.autoDeleteData,
          comment: task.comment,
          configId: hasId(task.config) ? task.config.id : undefined,
          hostsOrdering: task.hostsOrdering,
          id: task.id,
          inAssets: task.inAssets,
          maxChecks: task.maxChecks,
          maxHosts: task.maxHosts,
          title: _('Edit Task {{name}}', task),
          task,
        }),
      );
    } else {
      const alertIds = isDefined(defaultAlertId) ? [defaultAlertId] : [];
      const scannerId = isDefined(defaultScannerId)
        ? defaultScannerId
        : OPENVAS_DEFAULT_SCANNER_ID;
      const configId = isDefined(defaultScanConfigId)
        ? defaultScanConfigId
        : FULL_AND_FAST_SCAN_CONFIG_ID;

      dispatchState(
        updateState({
          taskDialogVisible: true,
          alertIds,
          configId: configId,
          scannerId: scannerId,
          scheduleId: defaultScheduleId,
          targetId: defaultTargetId,
          title: _('New Task'),
          applyOverrides: undefined,
          autoDelete: undefined,
          autoDeleteData: undefined,
          comment: undefined,
          hostsOrdering: undefined,
          id: undefined,
          maxChecks: undefined,
          maxHosts: undefined,
          minQod: undefined,
          name: undefined,
          schedulePeriods: undefined,
          sourceIface: undefined,
          task: undefined,
        }),
      );

      handleInteraction();
    }
  };

  const openTaskWizard = () => {
    gmp.wizard.task().then(response => {
      const settings = response.data;
      dispatchState(
        updateState({
          taskWizardVisible: true,
          hosts: settings.client_address,
          portListId: defaultPortListId,
          alertId: defaultAlertId,
          configId: defaultScanConfigId,
          sshCredential: defaultSshCredential,
          smbCredential: defaultSmbCredential,
          esxiCredential: defaultEsxiCredential,
          scannerId: defaultScannerId,
        }),
      );
    });
    handleInteraction();
  };

  const handleCloseTaskWizard = () => {
    closeTaskWizard();
    handleInteraction();
  };

  const handleSaveTaskWizard = data => {
    handleInteraction();

    return runQuickFirstScan(data)
      .then(onTaskWizardSaved, onTaskWizardError)
      .then(() => closeTaskWizard());
  };

  const openAdvancedTaskWizard = () => {
    const configId = isDefined(defaultScanConfigId)
      ? defaultScanConfigId
      : FULL_AND_FAST_SCAN_CONFIG_ID;

    loadCredentials();
    loadScanConfigs();

    gmp.wizard.advancedTask().then(response => {
      const settings = response.data;

      const now = date().tz(timezone);

      dispatchState(
        updateState({
          advancedTaskWizardVisible: true,
          alertId: defaultAlertId,
          taskName: _('New Quick Task'),
          targetHosts: settings.client_address,
          portListId: defaultPortListId,
          configId,
          sshCredential: defaultSshCredential,
          smbCredential: defaultSmbCredential,
          esxiCredential: defaultEsxiCredential,
          scannerId: defaultScannerId,
          startDate: now,
          startMinute: now.minutes(),
          startHour: now.hours(),
          startTimezone: timezone,
        }),
      );
    });
    handleInteraction();
  };

  const closeAdvancedTaskWizard = () => {
    dispatchState(updateState({advancedTaskWizardVisible: false}));
  };

  const handleCloseAdvancedTaskWizard = () => {
    closeAdvancedTaskWizard();
    handleInteraction();
  };

  const handleSaveAdvancedTaskWizard = data => {
    handleInteraction();

    return runQuickTask(data)
      .then(onAdvancedTaskWizardSaved, onAdvancedTaskWizardError)
      .then(() => closeAdvancedTaskWizard());
  };

  const openModifyTaskWizard = () => {
    gmp.wizard.modifyTask().then(response => {
      const settings = response.data;
      const now = date().tz(timezone);

      dispatchState(
        updateState({
          modifyTaskWizardVisible: true,
          tasks: settings.tasks,
          reschedule: NO_VALUE,
          taskId: selectSaveId(settings.tasks),
          startDate: now,
          startMinute: now.minutes(),
          startHour: now.hours(),
          startTimezone: timezone,
        }),
      );
    });
    handleInteraction();
  };

  const closeModifyTaskWizard = () => {
    dispatchState(updateState({modifyTaskWizardVisible: false}));
  };

  const handleCloseModifyTaskWizard = () => {
    closeModifyTaskWizard();
    handleInteraction();
  };

  const handleSaveModifyTaskWizard = data => {
    handleInteraction();

    return runModifyTask(data)
      .then(onModifyTaskWizardSaved, onModifyTaskWizardError)
      .then(() => closeModifyTaskWizard());
  };

  const openReportImportDialog = task => {
    dispatchState(
      updateState({
        reportImportDialogVisible: true,
        tasks: [task],
        taskId: task.id,
      }),
    );

    handleInteraction();
  };

  const closeReportImportDialog = () => {
    dispatchState(
      updateState({
        reportImportDialogVisible: false,
      }),
    );
  };

  const handleCloseReportImportDialog = () => {
    closeReportImportDialog();
    handleInteraction();
  };

  const handleReportImport = data => {
    handleInteraction();

    return gmp.report
      .import(data)
      .then(onReportImported, onReportImportError)
      .then(() => closeReportImportDialog());
  };

  const handleScanConfigChange = configId => {
    dispatchState(updateState({configId}));
  };

  const handleScannerChange = scannerId => {
    dispatchState(updateState({scannerId}));
  };

  const handleTaskDialogErrorClose = () => {
    dispatchState(updateState({error: undefined}));
  };

  useEffect(() => {
    // display first loading error in the dialog
    if (scanConfigError) {
      dispatchState(
        updateState({
          error: _('Error while loading scan configs.'),
        }),
      );
    } else if (scannerError) {
      dispatchState(
        updateState({
          error: _('Error while loading scanners.'),
        }),
      );
    } else if (scheduleError) {
      dispatchState(
        updateState({
          error: _('Error while loading schedules.'),
        }),
      );
    } else if (targetError) {
      dispatchState(
        updateState({
          error: _('Error while loading targets.'),
        }),
      );
    } else if (alertError) {
      dispatchState(
        updateState({
          error: _('Error while loading alerts.'),
        }),
      );
    } else if (credentialError) {
      dispatchState(
        updateState({
          error: _('Error while loading credentials.'),
        }),
      );
    }

    // log error all objects to be able to inspect them the console
    if (scanConfigError) {
      log.error({scanConfigError});
    }
    if (scannerError) {
      log.error({scannerError});
    }
    if (scheduleError) {
      log.error({scheduleError});
    }
    if (targetError) {
      log.error({targetError});
    }
    if (alertError) {
      log.error({alertError});
    }
    if (credentialError) {
      log.error({credentialError});
    }
  }, [
    scanConfigError,
    scannerError,
    scheduleError,
    targetError,
    alertError,
    credentialError,
  ]);

  const {
    advancedTaskWizardVisible,
    containerTaskDialogVisible,
    modifyTaskWizardVisible,
    taskDialogVisible,
    taskWizardVisible,
    reportImportDialogVisible,
    alterable,
    applyOverrides,
    error,
    maxChecks,
    maxHosts,
    minQod,
    schedulePeriods,
    sourceIface,
    autoDelete,
    autoDeleteData,
    comment,
    id,
    inAssets,
    task,
    title,
    name,
    hostsOrdering,
    portListId,
    alertId,
    sshCredential,
    smbCredential,
    esxiCredential,
    taskName,
    targetHosts,
    startDate,
    reschedule,
    alertIds,
    configId,
    scannerId,
    scheduleId,
    tagId,
    targetId,
    tasks,
    taskId,
    startTimezone,
    hosts,
  } = state;

  return (
    <React.Fragment>
      <EntityComponent
        name="task"
        onCreated={onCreated}
        onCreateError={onCreateError}
        onCloned={onCloned}
        onCloneError={onCloneError}
        onDeleted={onDeleted}
        onDeleteError={onDeleteError}
        onDownloaded={onDownloaded}
        onDownloadError={onDownloadError}
        onInteraction={onInteraction}
      >
        {other => (
          <React.Fragment>
            {children({
              ...other,
              create: openTaskDialog,
              createcontainer: openContainerTaskDialog,
              edit: openTaskDialog,
              start: handleTaskStart,
              stop: handleTaskStop,
              resume: handleTaskResume,
              reportimport: openReportImportDialog,
              advancedtaskwizard: openAdvancedTaskWizard,
              modifytaskwizard: openModifyTaskWizard,
              taskwizard: openTaskWizard,
            })}

            {taskDialogVisible && (
              <TargetComponent
                onCreated={handleTargetCreated}
                onInteraction={onInteraction}
              >
                {({create: createtarget}) => (
                  <AlertComponent
                    onCreated={handleAlertCreated}
                    onInteraction={onInteraction}
                  >
                    {({create: createalert}) => (
                      <ScheduleComponent
                        onCreated={handleScheduleCreated}
                        onInteraction={onInteraction}
                      >
                        {({create: createschedule}) => (
                          <TaskDialog
                            alerts={alerts}
                            alert_ids={alertIds}
                            alterable={alterable}
                            apply_overrides={applyOverrides}
                            auto_delete={autoDelete}
                            auto_delete_data={autoDeleteData}
                            comment={comment}
                            config_id={configId}
                            error={error}
                            hosts_ordering={hostsOrdering}
                            id={id}
                            in_assets={inAssets}
                            isLoadingAlerts={isLoadingAlerts}
                            isLoadingConfigs={isLoadingConfigs}
                            isLoadingScanners={isLoadingScanners}
                            isLoadingSchedules={isLoadingSchedules}
                            isLoadingTargets={isLoadingTargets}
                            isLoadingTags={isLoadingTags}
                            max_checks={maxChecks}
                            max_hosts={maxHosts}
                            min_qod={minQod}
                            name={name}
                            scan_configs={scanConfigs}
                            scanner_id={scannerId}
                            scanners={scanners}
                            schedule_id={scheduleId}
                            schedule_periods={schedulePeriods}
                            schedules={schedules}
                            source_iface={sourceIface}
                            tag_id={tagId}
                            tags={tags}
                            target_id={targetId}
                            targets={targets}
                            task={task}
                            title={title}
                            onAlertsChange={handleAlertsChange}
                            onErrorClose={handleTaskDialogErrorClose}
                            onNewAlertClick={createalert}
                            onNewTargetClick={createtarget}
                            onNewScheduleClick={createschedule}
                            onScanConfigChange={handleScanConfigChange}
                            onScannerChange={handleScannerChange}
                            onScheduleChange={handleScheduleChange}
                            onTargetChange={handleTargetChange}
                            onClose={handleCloseTaskDialog}
                            onSave={handleSaveTask}
                          />
                        )}
                      </ScheduleComponent>
                    )}
                  </AlertComponent>
                )}
              </TargetComponent>
            )}
          </React.Fragment>
        )}
      </EntityComponent>

      {containerTaskDialogVisible && (
        <ContainerTaskDialog
          task={task}
          name={name}
          comment={comment}
          id={id}
          in_assets={inAssets}
          auto_delete={autoDelete}
          auto_delete_data={autoDeleteData}
          title={title}
          onClose={handleCloseContainerTaskDialog}
          onSave={handleSaveContainerTask}
        />
      )}

      {taskWizardVisible && (
        <TaskWizard
          hosts={hosts}
          port_list_id={portListId}
          alert_id={alertId}
          config_id={configId}
          ssh_credential={sshCredential}
          smb_credential={smbCredential}
          esxi_credential={esxiCredential}
          scanner_id={scannerId}
          onClose={handleCloseTaskWizard}
          onSave={handleSaveTaskWizard}
          onNewClick={handleTaskWizardNewClick}
        />
      )}

      {advancedTaskWizardVisible && (
        <AdvancedTaskWizard
          credentials={credentials}
          scanConfigs={scanConfigs}
          startDate={startDate}
          taskName={taskName}
          targetHosts={targetHosts}
          configId={configId}
          sshCredential={sshCredential}
          smbCredential={smbCredential}
          esxiCredential={esxiCredential}
          startTimezone={startTimezone}
          onClose={handleCloseAdvancedTaskWizard}
          onSave={handleSaveAdvancedTaskWizard}
        />
      )}

      {modifyTaskWizardVisible && (
        <ModifyTaskWizard
          startDate={startDate}
          tasks={tasks}
          reschedule={reschedule}
          taskId={taskId}
          startTimezone={startTimezone}
          onClose={handleCloseModifyTaskWizard}
          onSave={handleSaveModifyTaskWizard}
        />
      )}

      {reportImportDialogVisible && (
        <ImportReportDialog
          newContainerTask={false}
          task_id={taskId}
          tasks={tasks}
          onClose={handleCloseReportImportDialog}
          onSave={handleReportImport}
        />
      )}
    </React.Fragment>
  );
};

TaskComponent.propTypes = {
  children: PropTypes.func.isRequired,
  onAdvancedTaskWizardError: PropTypes.func,
  onAdvancedTaskWizardSaved: PropTypes.func,
  onCloneError: PropTypes.func,
  onCloned: PropTypes.func,
  onContainerCreateError: PropTypes.func,
  onContainerCreated: PropTypes.func,
  onContainerSaveError: PropTypes.func,
  onContainerSaved: PropTypes.func,
  onCreateError: PropTypes.func,
  onCreated: PropTypes.func,
  onDeleteError: PropTypes.func,
  onDeleted: PropTypes.func,
  onDownloadError: PropTypes.func,
  onDownloaded: PropTypes.func,
  onInteraction: PropTypes.func.isRequired,
  onModifyTaskWizardError: PropTypes.func,
  onModifyTaskWizardSaved: PropTypes.func,
  onReportImportError: PropTypes.func,
  onReportImported: PropTypes.func,
  onResumeError: PropTypes.func,
  onResumed: PropTypes.func,
  onSaveError: PropTypes.func,
  onSaved: PropTypes.func,
  onStartError: PropTypes.func,
  onStarted: PropTypes.func,
  onStopError: PropTypes.func,
  onStopped: PropTypes.func,
  onTaskWizardError: PropTypes.func,
  onTaskWizardSaved: PropTypes.func,
};

export default TaskComponent;

/* Copyright (C) 2017-2020 Greenbone Networks GmbH
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

import React, {useState, useEffect} from 'react';

import {connect} from 'react-redux';

import _ from 'gmp/locale';

import logger from 'gmp/log';

import {ALL_FILTER} from 'gmp/models/filter';

import {NO_VALUE} from 'gmp/parser';

import {map} from 'gmp/utils/array';
import {isDefined} from 'gmp/utils/identity';
import {selectSaveId, hasId} from 'gmp/utils/id';

import date from 'gmp/models/date';
import ScanConfig, {FULL_AND_FAST_SCAN_CONFIG_ID} from 'gmp/models/scanconfig';
import {OPENVAS_DEFAULT_SCANNER_ID} from 'gmp/models/scanner';

import {
  loadEntities as loadTags,
  selector as tagsSelector,
} from 'web/store/entities/tags';

import {getTimezone} from 'web/store/usersettings/selectors';

import {loadUserSettingDefaults} from 'web/store/usersettings/defaults/actions';
import {getUserSettingsDefaults} from 'web/store/usersettings/defaults/selectors';

import compose from 'web/utils/compose';
import PropTypes from 'web/utils/proptypes';
import useGmp from 'web/utils/useGmp';
import {UNSET_VALUE} from 'web/utils/render';
import useCapabilities from 'web/utils/useCapabilities';

import EntityComponent from 'web/entity/component';

import {useLazyGetAlerts} from 'web/graphql/alerts';

import {useLazyGetCredentials} from 'web/graphql/credentials';

import {useLazyGetScanners} from 'web/graphql/scanners';

import {useGetScanConfigs} from 'web/graphql/scanconfigs';

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

import ImportReportDialog from 'web/pages/reports/importdialog';

import AdvancedTaskWizard from 'web/wizard/advancedtaskwizard';
import ModifyTaskWizard from 'web/wizard/modifytaskwizard';
import TaskWizard from 'web/wizard/taskwizard';

import ScheduleComponent from 'web/pages/schedules/component';
import AlertComponent from 'web/pages/alerts/component';
import TargetComponent from 'web/pages/targets/component';

import TaskDialog from './dialog';
import ContainerTaskDialog from './containerdialog';

const log = logger.getLogger('web.pages.tasks.component');

const TaskComponent = props => {
  //GMP and Redux
  const gmp = useGmp();

  // GraphQL Queries and Mutations
  const [modifyTask] = useModifyTask();
  const [createTask] = useCreateTask();
  const [createContainerTask] = useCreateContainerTask();
  const [startTask] = useStartTask();
  const [stopTask] = useStopTask();
  const [resumeTask] = useResumeTask();

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

  const scanConfigQuery = useGetScanConfigs();
  const [
    loadScanConfigs,
    {data: scanConfigData, loading: isLoadingConfigs, error: scanConfigError},
  ] = scanConfigQuery({
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

  const capabilities = useCapabilities();

  // default values
  const {
    defaultPortListId,
    defaultAlertId,
    defaultScanConfigId,
    defaultSshCredential,
    defaultSmbCredential,
    defaultEsxiCredential,
  } = props;

  // Dialog and wizard visibility flags
  const [advancedTaskWizardVisible, toggleAdvancedTaskWizardVisible] = useState(
    false,
  );
  const [
    containerTaskDialogVisible,
    toggleContainerTaskDialogVisible,
  ] = useState(false);
  const [modifyTaskWizardVisible, toggleModifyTaskWizardVisible] = useState(
    false,
  );
  const [taskDialogVisible, toggleTaskDialogVisible] = useState(false);
  const [taskWizardVisible, toggleTaskWizardVisible] = useState(false);
  const [reportImportDialogVisible, toggleReportImportDialogVisible] = useState(
    false,
  );

  // Dialog and wizard dialog state
  const [dialogState, setDialogState] = useState({
    target_id: UNSET_VALUE,
    alert_ids: [],
    schedule_id: UNSET_VALUE,
    scanner_id: UNSET_VALUE,
    config_id: defaultScanConfigId,
  });

  // Not sure where tag_id is set
  const [tag_id] = useState();

  const [scanConfigs, setScanConfigs] = useState();

  useEffect(() => {
    if (isDefined(scanConfigData)) {
      setScanConfigs(
        scanConfigData.scanConfigs.nodes.map(scanConfig =>
          ScanConfig.fromElement(scanConfig),
        ),
      );
    }
  }, [scanConfigData]);

  useEffect(() => {
    props.loadUserSettingsDefaults();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const handleInteraction = () => {
    const {onInteraction} = props;
    if (isDefined(onInteraction)) {
      onInteraction();
    }
  };

  const handleTargetChange = targetId => {
    setDialogState(state => ({
      ...state,
      target_id: targetId,
    }));
  };

  const handleAlertsChange = alertIds => {
    setDialogState(state => ({
      ...state,
      alert_ids: alertIds,
    }));
  };

  const handleScheduleChange = scheduleId => {
    setDialogState(state => ({
      ...state,
      schedule_id: scheduleId,
    }));
  };

  const handleTaskStart = task => {
    const {onStarted, onStartError} = props;

    handleInteraction();

    return startTask(task.id).then(onStarted, onStartError);
  };

  const handleTaskStop = task => {
    const {onStopped, onStopError} = props;

    handleInteraction();

    return stopTask(task.id).then(onStopped, onStopError);
  };

  const handleTaskResume = task => {
    const {onResumed, onResumeError} = props;

    handleInteraction();

    return resumeTask(task.id).then(onResumed, onResumeError);
  };

  const closeTaskWizard = () => {
    toggleTaskWizardVisible(false);
  };

  const handleTaskWizardNewClick = () => {
    openTaskDialog();
    closeTaskWizard();
  };

  const handleAlertCreated = () => {
    refetchAlerts();
  };

  const handleScheduleCreated = resp => {
    const {data} = resp;

    refetchSchedules();

    setDialogState(state => ({
      ...state,
      schedule_id: data.createSchedule?.id,
    }));
  };

  const handleTargetCreated = resp => {
    const {data} = resp;
    refetchTargets();
    setDialogState(state => ({
      ...state,
      target_id: data?.createTarget?.id,
    }));
  };

  const openContainerTaskDialog = inputTask => {
    toggleContainerTaskDialogVisible(true);

    setDialogState(state => ({
      ...state,
      task: inputTask,
      name: inputTask ? inputTask.name : _('Unnamed'),
      comment: inputTask ? inputTask.comment : '',
      id: inputTask ? inputTask.id : undefined,
      in_assets: inputTask ? inputTask.inAssets : undefined,
      auto_delete: inputTask ? inputTask.autoDelete : undefined,
      auto_delete_data: inputTask ? inputTask.autoDeleteData : undefined,
      title: inputTask
        ? _('Edit Container Task {{name}}', inputTask)
        : _('New Container Task'),
    }));

    handleInteraction();
  };

  const closeContainerTaskDialog = () => {
    toggleContainerTaskDialogVisible(false);
  };

  const handleCloseContainerTaskDialog = () => {
    closeContainerTaskDialog();
    handleInteraction();
  };

  const handleSaveContainerTask = data => {
    handleInteraction();

    if (isDefined(data.id)) {
      const {onContainerSaved, onContainerSaveError} = props;
      return modifyTask({
        id: data.id,
        name: data.name,
        comment: data.comment,
      })
        .then(onContainerSaved, onContainerSaveError)
        .then(() => closeContainerTaskDialog());
    }
    const {onContainerCreated, onContainerCreateError} = props;
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

        setDialogState(state => ({
          ...state,
          target_id: undefined,
          scanner_id: undefined,
          config_id: undefined,
        }));
      }
      const {onSaved, onSaveError} = props;

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
    const {onCreated, onCreateError} = props;
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
    toggleTaskDialogVisible(false);
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
    props.loadTags();

    if (isDefined(task)) {
      const canAccessSchedules =
        capabilities.mayAccess('schedules') && isDefined(task.schedule);
      const schedule_id = canAccessSchedules ? task.schedule.id : UNSET_VALUE;
      const schedule_periods = canAccessSchedules
        ? task.schedulePeriods
        : undefined;

      setDialogState(state => ({
        ...state,
        error: undefined, // remove old errors
        min_qod: task.minQod,
        source_iface: task.sourceIface,
        schedule_periods,
        scanner_id: hasId(task.scanner) ? task.scanner.id : undefined,
        name: task.name,
        schedule_id,
        target_id: hasId(task.target) ? task.target.id : undefined,
        alert_ids: map(task.alerts, alert => alert.id),
        alterable: task.alterable,
        apply_overrides: task.applyOverrides,
        auto_delete: task.autoDelete,
        auto_delete_data: task.autoDeleteData,
        comment: task.comment,
        config_id: hasId(task.config) ? task.config.id : undefined,
        hosts_ordering: task.hostsOrdering,
        id: task.id,
        in_assets: task.inAssets,
        max_checks: task.maxChecks,
        max_hosts: task.maxHosts,
        title: _('Edit Task {{name}}', task),
        task,
      }));

      toggleTaskDialogVisible(true);
    } else {
      const {
        defaultAlertId,
        defaultScanConfigId = FULL_AND_FAST_SCAN_CONFIG_ID,
        defaultScannerId = OPENVAS_DEFAULT_SCANNER_ID,
        defaultScheduleId,
        defaultTargetId,
      } = props;

      const alert_ids = isDefined(defaultAlertId) ? [defaultAlertId] : [];

      setDialogState(state => ({
        ...state,
        alert_ids,
        config_id: defaultScanConfigId,
        scanner_id: defaultScannerId,
        schedule_id: defaultScheduleId,
        target_id: defaultTargetId,
        title: _('New Task'),
        apply_overrides: undefined,
        auto_delete: undefined,
        auto_delete_data: undefined,
        comment: undefined,
        hosts_ordering: undefined,
        id: undefined,
        max_checks: undefined,
        max_hosts: undefined,
        min_qod: undefined,
        name: undefined,
        schedule_periods: undefined,
        source_iface: undefined,
        task: undefined,
      }));

      toggleTaskDialogVisible(true);

      handleInteraction();
    }
  };

  const openTaskWizard = () => {
    const {defaultScanConfigId, defaultScannerId} = props;

    gmp.wizard.task().then(response => {
      const settings = response.data;
      toggleTaskWizardVisible(true);

      setDialogState(state => ({
        ...state,
        hosts: settings.client_address,
        port_list_id: defaultPortListId,
        alert_id: defaultAlertId,
        config_id: defaultScanConfigId,
        ssh_credential: defaultSshCredential,
        smb_credential: defaultSmbCredential,
        esxi_credential: defaultEsxiCredential,
        scanner_id: defaultScannerId,
      }));
    });
    handleInteraction();
  };

  const handleCloseTaskWizard = () => {
    closeTaskWizard();
    handleInteraction();
  };

  const handleSaveTaskWizard = data => {
    const {onTaskWizardSaved, onTaskWizardError} = props;

    handleInteraction();

    return gmp.wizard
      .runQuickFirstScan(data)
      .then(onTaskWizardSaved, onTaskWizardError)
      .then(() => closeTaskWizard());
  };

  const openAdvancedTaskWizard = () => {
    const {
      timezone,
      defaultScanConfigId = FULL_AND_FAST_SCAN_CONFIG_ID,
      defaultScannerId,
    } = props;

    loadCredentials();
    loadScanConfigs();

    gmp.wizard.advancedTask().then(response => {
      const settings = response.data;

      const now = date().tz(timezone);

      toggleAdvancedTaskWizardVisible(true);
      setDialogState(state => ({
        ...state,
        alert_id: defaultAlertId,
        task_name: _('New Quick Task'),
        target_hosts: settings.client_address,
        port_list_id: defaultPortListId,
        config_id: defaultScanConfigId,
        ssh_credential: defaultSshCredential,
        smb_credential: defaultSmbCredential,
        esxi_credential: defaultEsxiCredential,
        scanner_id: defaultScannerId,
        start_date: now,
        start_minute: now.minutes(),
        start_hour: now.hours(),
        start_timezone: timezone,
      }));
    });
    handleInteraction();
  };

  const closeAdvancedTaskWizard = () => {
    toggleAdvancedTaskWizardVisible(false);
  };

  const handleCloseAdvancedTaskWizard = () => {
    closeAdvancedTaskWizard();
    handleInteraction();
  };

  const handleSaveAdvancedTaskWizard = data => {
    const {onAdvancedTaskWizardSaved, onAdvancedTaskWizardError} = props;

    handleInteraction();

    return gmp.wizard
      .runQuickTask(data)
      .then(onAdvancedTaskWizardSaved, onAdvancedTaskWizardError)
      .then(() => closeAdvancedTaskWizard());
  };

  const openModifyTaskWizard = () => {
    const {timezone} = props;

    gmp.wizard.modifyTask().then(response => {
      const settings = response.data;
      const now = date().tz(timezone);

      toggleModifyTaskWizardVisible(true);

      setDialogState(state => ({
        ...state,
        tasks: settings.tasks,
        reschedule: NO_VALUE,
        task_id: selectSaveId(settings.tasks),
        start_date: now,
        start_minute: now.minutes(),
        start_hour: now.hours(),
        start_timezone: timezone,
      }));
    });
    handleInteraction();
  };

  const closeModifyTaskWizard = () => {
    toggleModifyTaskWizardVisible(false);
  };

  const handleCloseModifyTaskWizard = () => {
    closeModifyTaskWizard();
    handleInteraction();
  };

  const handleSaveModifyTaskWizard = data => {
    const {onModifyTaskWizardSaved, onModifyTaskWizardError} = props;

    handleInteraction();

    return gmp.wizard
      .runModifyTask(data)
      .then(onModifyTaskWizardSaved, onModifyTaskWizardError)
      .then(() => closeModifyTaskWizard());
  };

  const openReportImportDialog = task => {
    toggleReportImportDialogVisible(true);
    setDialogState(state => ({
      ...state,
      tasks: [task],
      task_id: task.id,
    }));

    handleInteraction();
  };

  const closeReportImportDialog = () => {
    toggleReportImportDialogVisible(false);
  };

  const handleCloseReportImportDialog = () => {
    closeReportImportDialog();
    handleInteraction();
  };

  const handleReportImport = data => {
    const {onReportImported, onReportImportError} = props;

    handleInteraction();

    return gmp.report
      .import(data)
      .then(onReportImported, onReportImportError)
      .then(() => closeReportImportDialog());
  };

  const handleScanConfigChange = configId => {
    setDialogState(state => ({
      ...state,
      config_id: configId,
    }));
  };

  const handleScannerChange = scannerId => {
    setDialogState(state => ({
      ...state,
      scanner_id: scannerId,
    }));
  };

  const handleTaskDialogErrorClose = () => {
    setDialogState(state => ({...state, error: undefined}));
  };

  useEffect(() => {
    // display first loading error in the dialog
    if (scanConfigError) {
      setDialogState(state => ({
        ...state,
        error: _('Error while loading scan configs.'),
      }));
    } else if (scannerError) {
      setDialogState(state => ({
        ...state,
        error: _('Error while loading scanners.'),
      }));
    } else if (scheduleError) {
      setDialogState(state => ({
        ...state,
        error: _('Error while loading schedules.'),
      }));
    } else if (targetError) {
      setDialogState(state => ({
        ...state,
        error: _('Error while loading targets.'),
      }));
    } else if (alertError) {
      setDialogState(state => ({
        ...state,
        error: _('Error while loading alerts.'),
      }));
    } else if (credentialError) {
      setDialogState(state => ({
        ...state,
        error: _('Error while loading credentials.'),
      }));
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
    isLoadingTags,
    tags,
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
  } = props;

  const {
    alterable,
    apply_overrides,
    error,
    max_checks,
    max_hosts,
    min_qod,
    schedule_periods,
    source_iface,
    auto_delete,
    auto_delete_data,
    comment,
    id,
    in_assets,
    task,
    title,
    name,
    hosts_ordering,
    port_list_id,
    alert_id,
    ssh_credential,
    smb_credential,
    esxi_credential,
    task_name,
    target_hosts,
    start_date,
    start_minute,
    start_hour,
    reschedule,
    alert_ids,
    config_id,
    scanner_id,
    schedule_id,
    target_id,
    tasks,
    task_id,
    start_timezone,
    hosts,
  } = dialogState;

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
                            alert_ids={alert_ids}
                            alterable={alterable}
                            apply_overrides={apply_overrides}
                            auto_delete={auto_delete}
                            auto_delete_data={auto_delete_data}
                            comment={comment}
                            config_id={config_id}
                            error={error}
                            hosts_ordering={hosts_ordering}
                            id={id}
                            in_assets={in_assets}
                            isLoadingAlerts={isLoadingAlerts}
                            isLoadingConfigs={isLoadingConfigs}
                            isLoadingScanners={isLoadingScanners}
                            isLoadingSchedules={isLoadingSchedules}
                            isLoadingTargets={isLoadingTargets}
                            isLoadingTags={isLoadingTags}
                            max_checks={max_checks}
                            max_hosts={max_hosts}
                            min_qod={min_qod}
                            name={name}
                            scan_configs={scanConfigs}
                            scanner_id={scanner_id}
                            scanners={scanners}
                            schedule_id={schedule_id}
                            schedule_periods={schedule_periods}
                            schedules={schedules}
                            source_iface={source_iface}
                            tag_id={tag_id}
                            tags={tags}
                            target_id={target_id}
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
          in_assets={in_assets}
          auto_delete={auto_delete}
          auto_delete_data={auto_delete_data}
          title={title}
          onClose={handleCloseContainerTaskDialog}
          onSave={handleSaveContainerTask}
        />
      )}

      {taskWizardVisible && (
        <TaskWizard
          hosts={hosts}
          port_list_id={port_list_id}
          alert_id={alert_id}
          config_id={config_id}
          ssh_credential={ssh_credential}
          smb_credential={smb_credential}
          esxi_credential={esxi_credential}
          scanner_id={scanner_id}
          onClose={handleCloseTaskWizard}
          onSave={handleSaveTaskWizard}
          onNewClick={handleTaskWizardNewClick}
        />
      )}

      {advancedTaskWizardVisible && (
        <AdvancedTaskWizard
          credentials={credentials}
          scan_configs={scanConfigs}
          start_date={start_date}
          task_name={task_name}
          target_hosts={target_hosts}
          port_list_id={port_list_id}
          alert_id={alert_id}
          config_id={config_id}
          ssh_credential={ssh_credential}
          smb_credential={smb_credential}
          esxi_credential={esxi_credential}
          scanner_id={scanner_id}
          start_minute={start_minute}
          start_hour={start_hour}
          start_timezone={start_timezone}
          onClose={handleCloseAdvancedTaskWizard}
          onSave={handleSaveAdvancedTaskWizard}
        />
      )}

      {modifyTaskWizardVisible && (
        <ModifyTaskWizard
          start_date={start_date}
          tasks={tasks}
          reschedule={reschedule}
          task_id={task_id}
          start_minute={start_minute}
          start_hour={start_hour}
          start_timezone={start_timezone}
          onClose={handleCloseModifyTaskWizard}
          onSave={handleSaveModifyTaskWizard}
        />
      )}

      {reportImportDialogVisible && (
        <ImportReportDialog
          newContainerTask={false}
          task_id={task_id}
          tasks={tasks}
          onClose={handleCloseReportImportDialog}
          onSave={handleReportImport}
        />
      )}
    </React.Fragment>
  );
};

TaskComponent.propTypes = {
  alerts: PropTypes.arrayOf(PropTypes.model),
  children: PropTypes.func.isRequired,
  credentials: PropTypes.arrayOf(PropTypes.model),
  defaultAlertId: PropTypes.id,
  defaultEsxiCredential: PropTypes.id,
  defaultPortListId: PropTypes.id,
  defaultScanConfigId: PropTypes.id,
  defaultScannerId: PropTypes.id,
  defaultScheduleId: PropTypes.id,
  defaultSmbCredential: PropTypes.id,
  defaultSshCredential: PropTypes.id,
  defaultTargetId: PropTypes.id,
  isLoadingAlerts: PropTypes.bool,
  isLoadingConfigs: PropTypes.bool,
  isLoadingScanners: PropTypes.bool,
  isLoadingSchedules: PropTypes.bool,
  isLoadingTags: PropTypes.bool,
  isLoadingTargets: PropTypes.bool,
  loadAlerts: PropTypes.func,
  loadCredentials: PropTypes.func.isRequired,
  loadTags: PropTypes.func.isRequired,
  loadUserSettingsDefaults: PropTypes.func.isRequired,
  scanConfigs: PropTypes.arrayOf(PropTypes.model),
  scanners: PropTypes.arrayOf(PropTypes.model),
  tags: PropTypes.arrayOf(PropTypes.model),
  targets: PropTypes.arrayOf(PropTypes.model),
  timezone: PropTypes.string.isRequired,
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

const TAGS_FILTER = ALL_FILTER.copy().set('resource_type', 'task');

const mapStateToProps = rootState => {
  const userDefaults = getUserSettingsDefaults(rootState);
  const tagsSel = tagsSelector(rootState);
  return {
    timezone: getTimezone(rootState),
    defaultAlertId: userDefaults.getValueByName('defaultalert'),
    defaultEsxiCredential: userDefaults.getValueByName('defaultesxicredential'),
    defaultPortListId: userDefaults.getValueByName('defaultportlist'),
    defaultScanConfigId: userDefaults.getValueByName(
      'defaultopenvasscanconfig',
    ),
    defaultScannerId: userDefaults.getValueByName('defaultopenvasscanner'),
    defaultScheduleId: userDefaults.getValueByName('defaultschedule'),
    defaultSshCredential: userDefaults.getValueByName('defaultsshcredential'),
    defaultSmbCredential: userDefaults.getValueByName('defaultsmbcredential'),
    defaultTargetId: userDefaults.getValueByName('defaulttarget'),
    isLoadingTags: tagsSel.isLoadingAllEntities(ALL_FILTER),
    tags: tagsSel.getEntities(TAGS_FILTER),
  };
};

const mapDispatchToProp = (dispatch, {gmp}) => ({
  loadTags: () => dispatch(loadTags(gmp)(TAGS_FILTER)),
  loadUserSettingsDefaults: () => dispatch(loadUserSettingDefaults(gmp)()),
});

export default compose(connect(mapStateToProps, mapDispatchToProp))(
  TaskComponent,
);

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

import {ALL_FILTER} from 'gmp/models/filter';

import {NO_VALUE} from 'gmp/parser';

import {map} from 'gmp/utils/array';
import {isDefined} from 'gmp/utils/identity';
import {selectSaveId, hasId} from 'gmp/utils/id';

import date from 'gmp/models/date';
import ScanConfig, {FULL_AND_FAST_SCAN_CONFIG_ID} from 'gmp/models/scanconfig';
import Scanner, {OPENVAS_DEFAULT_SCANNER_ID} from 'gmp/models/scanner';
import Target from 'gmp/models/target';

import {
  loadEntities as loadAlerts,
  selector as alertSelector,
} from 'web/store/entities/alerts';

import {
  loadEntities as loadCredentials,
  selector as credentialsSelector,
} from 'web/store/entities/credentials';

import {
  loadEntities as loadScanConfigs,
  selector as scanConfigsSelector,
} from 'web/store/entities/scanconfigs';

import {
  loadEntities as loadScanners,
  selector as scannerSelector,
} from 'web/store/entities/scanners';

import {
  loadEntities as loadSchedules,
  selector as scheduleSelector,
} from 'web/store/entities/schedules';

import {
  loadEntities as loadTags,
  selector as tagsSelector,
} from 'web/store/entities/tags';

import {
  loadEntities as loadTargets,
  selector as targetSelector,
} from 'web/store/entities/targets';

import {getTimezone} from 'web/store/usersettings/selectors';

import {loadUserSettingDefaults} from 'web/store/usersettings/defaults/actions';
import {getUserSettingsDefaults} from 'web/store/usersettings/defaults/selectors';

import compose from 'web/utils/compose';
import PropTypes from 'web/utils/proptypes';
import withGmp from 'web/utils/withGmp';
import {NULL_VALUE} from 'web/utils/render';
import useCapabilities from 'web/utils/useCapabilities';

import EntityComponent from 'web/entity/component';

import ImportReportDialog from 'web/pages/reports/importdialog';

import AdvancedTaskWizard from 'web/wizard/advancedtaskwizard';
import ModifyTaskWizard from 'web/wizard/modifytaskwizard';
import TaskWizard from 'web/wizard/taskwizard';

import ScheduleComponent from 'web/pages/schedules/component';
import AlertComponent from 'web/pages/alerts/component';
import TargetComponent from 'web/pages/targets/component';

import TaskDialog from './dialog';
import ContainerTaskDialog from './containerdialog';
import {setTimezone} from 'web/store/usersettings/actions';
import {
  useModifyTask,
  useCreateContainerTask,
  useCreateTask,
  useGetScanners,
  useGetScanConfigs,
  useGetTargets,
} from './graphql';

const TaskComponent = props => {
  const modifyTask = useModifyTask();
  const createTask = useCreateTask();
  const createContainerTask = useCreateContainerTask();

  const scannerQuery = useGetScanners();
  const [
    loadScanners,
    {data: scannerData, loading: isLoadingScanners},
  ] = scannerQuery({
    filterString: ALL_FILTER.toFilterString(),
  });

  const scanConfigQuery = useGetScanConfigs();
  const [
    loadScanConfigs,
    {data: scanConfigData, loading: isLoadingConfigs},
  ] = scanConfigQuery({
    filterString: ALL_FILTER.toFilterString(),
  });

  const targetQuery = useGetTargets();
  const [
    loadTargets,
    {data: targetData, loading: isLoadingTargets, refetch: refetchTargets},
  ] = targetQuery({
    filterString: ALL_FILTER.toFilterString(),
  });

  const capabilities = useCapabilities();

  const {
    defaultPortListId,
    defaultAlertId,
    defaultScanConfigId,
    defaultSshCredential,
    defaultSmbCredential,
    defaultEsxiCredential,
  } = props;
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
  const [target_id, setTargetId] = useState(0);
  const [alert_ids, setAlertIds] = useState([]);
  const [schedule_id, setScheduleId] = useState('0');
  const [name, setName] = useState(_('Unnamed'));
  const [comment, setComment] = useState('');
  const [id, setId] = useState();
  const [in_assets, setInAssets] = useState();
  const [auto_delete, setAutoDelete] = useState();
  const [auto_delete_data, setAutoDeleteData] = useState();
  const [title, setTitle] = useState('');
  const [scanner_id, setScannerId] = useState('0');
  const [alterable, setAlterable] = useState();
  const [apply_overrides, setApplyOverrides] = useState();
  const [hosts_ordering, setHostsOrdering] = useState();
  const [max_checks, setMaxChecks] = useState();
  const [max_hosts, setMaxHosts] = useState();
  const [task, setTask] = useState();
  const [schedule_periods, setSchedulePeriods] = useState(0);
  const [min_qod, setMinQod] = useState(70);
  const [source_iface, setSourceIFace] = useState('');
  const [hosts] = useState();
  const [port_list_id, setPortListId] = useState(defaultPortListId);
  const [alert_id, setAlertId] = useState(defaultAlertId);
  const [config_id, setConfigId] = useState(defaultScanConfigId);
  const [ssh_credential, setSshCredential] = useState(defaultSshCredential);
  const [smb_credential, setSmbCredential] = useState(defaultSmbCredential);
  const [esxi_credential, setEsxiCredential] = useState(defaultEsxiCredential);
  const [task_name, setTaskName] = useState(_('New Quick Task'));
  const [target_hosts, setTargetHosts] = useState();

  const [start_date, setStartDate] = useState();
  const [start_minute, setStartMinute] = useState();
  const [start_hour, setStartHour] = useState();
  const [start_timezone] = useState();
  const [tasks, setTasks] = useState();
  const [reschedule, setReschedule] = useState(NO_VALUE);
  const [task_id, setTaskId] = useState();
  const [reportImportDialogVisible, toggleReportImportDialogVisible] = useState(
    false,
  );
  const [tag_id] = useState();

  const [scanners, setScanners] = useState();

  useEffect(() => {
    if (isDefined(scannerData)) {
      setScanners(
        scannerData.scanners.nodes.map(scanner => Scanner.fromElement(scanner)),
      );
    }
  }, [scannerData]);

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

  const [targets, setTargets] = useState();

  useEffect(() => {
    if (isDefined(targetData)) {
      setTargets(
        targetData.targets.nodes.map(target => Target.fromObject(target)),
      );
    }
  }, [targetData]);

  const {gmp} = props;

  const cmd = gmp.task;

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
    setTargetId(targetId);
  };

  const handleAlertsChange = alertIds => {
    setAlertIds(alertIds);
  };

  const handleScheduleChange = scheduleId => {
    setScheduleId(scheduleId);
  };

  const handleTaskStart = task => {
    const {onStarted, onStartError} = props;

    handleInteraction();

    return cmd.start(task).then(onStarted, onStartError);
  };

  const handleTaskStop = task => {
    const {onStopped, onStopError} = props;

    handleInteraction();

    return cmd.stop(task).then(onStopped, onStopError);
  };

  const handleTaskResume = task => {
    const {onResumed, onResumeError} = props;

    handleInteraction();

    return cmd.resume(task).then(onResumed, onResumeError);
  };

  const closeTaskWizard = () => {
    toggleTaskWizardVisible(false);
  };

  const handleTaskWizardNewClick = () => {
    openTaskDialog();
    closeTaskWizard();
  };

  const handleAlertCreated = resp => {
    const {data} = resp;

    props.loadAlerts();
    setAlertIds(({alert_ids}) => ({alert_ids: [data.id, ...alert_ids]}));
  };

  const handleScheduleCreated = resp => {
    const {data} = resp;

    props.loadSchedules();

    setScheduleId(data.id);
  };

  const handleTargetCreated = resp => {
    const {data} = resp;
    refetchTargets();
    setTargetId(data?.createTarget?.id);
  };

  const openContainerTaskDialog = task => {
    toggleContainerTaskDialogVisible(true);
    setTask(task);
    setName(task ? task.name : _('Unnamed'));
    setComment(task ? task.comment : '');
    setId(task ? task.id : undefined);
    setInAssets(task ? task.inAssets : undefined);
    setAutoDelete(task ? task.autoDelete : undefined);
    setAutoDeleteData(task ? task.autoDeleteData : undefined);
    setTitle(
      task ? _('Edit Container Task {{name}}', task) : _('New Container Task'),
    );

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
        taskId: data.id,
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
        setTargetId(undefined);
        setScannerId(undefined);
        setConfigId(undefined);
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
        taskId: id,
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
    props.loadAlerts();
    loadScanConfigs();
    loadScanners();
    props.loadSchedules();
    loadTargets();
    props.loadTags();

    if (isDefined(task)) {
      const canAccessSchedules =
        capabilities.mayAccess('schedules') && isDefined(task.schedule);
      const schedule_id = canAccessSchedules ? task.schedule.id : NULL_VALUE;
      const schedule_periods = canAccessSchedules
        ? task.schedulePeriods
        : undefined;

      setMinQod(task.minQod);
      setSourceIFace(task.sourceIface);
      setSchedulePeriods(schedule_periods);
      setScannerId(hasId(task.scanner) ? task.scanner.id : undefined);
      setName(task.name);
      setScheduleId(schedule_id);
      setTargetId(hasId(task.target) ? task.target.id : undefined);
      toggleTaskDialogVisible(true);
      setAlertIds(map(task.alerts, alert => alert.id));
      setAlterable(task.alterable);
      setApplyOverrides(task.applyOverrides);
      setAutoDelete(task.autoDelete);
      setAutoDeleteData(task.autoDeleteData);
      setComment(task.comment);
      setConfigId(hasId(task.config) ? task.config.id : undefined);
      setHostsOrdering(task.hostsOrdering);
      setId(task.id);
      setInAssets(task.inAssets);
      setMaxChecks(task.maxChecks);
      setMaxHosts(task.maxHosts);
      setTitle(_('Edit Task {{name}}', task));
      setTask(task);
    } else {
      const {
        defaultAlertId,
        defaultScanConfigId = FULL_AND_FAST_SCAN_CONFIG_ID,
        defaultScannerId = OPENVAS_DEFAULT_SCANNER_ID,
        defaultScheduleId,
        defaultTargetId,
      } = props;

      const alert_ids = isDefined(defaultAlertId) ? [defaultAlertId] : [];
      toggleTaskDialogVisible(true);
      setAlertIds(alert_ids);
      setApplyOverrides(undefined);
      setAutoDelete(undefined);
      setAutoDeleteData(undefined);
      setComment(undefined);
      setConfigId(defaultScanConfigId);
      setHostsOrdering(undefined);
      setId(undefined);
      setMaxChecks(undefined);
      setMaxHosts(undefined);
      setMinQod(undefined);
      setName(undefined);
      setScannerId(defaultScannerId);
      setScheduleId(defaultScheduleId);
      setSchedulePeriods(undefined);
      setSourceIFace(undefined);
      setTargetId(defaultTargetId);
      setTask(undefined);
      setTitle(_('New Task'));

      handleInteraction();
    }
  };

  const openTaskWizard = () => {
    const {
      gmp,
      defaultAlertId,
      defaultEsxiCredential,
      defaultPortListId,
      defaultScanConfigId,
      defaultScannerId,
      defaultSshCredential,
      defaultSmbCredential,
    } = props;

    gmp.wizard.task().then(response => {
      const settings = response.data;
      toggleTaskWizardVisible(true);
      setHostsOrdering(settings.client_address);
      setPortListId(defaultPortListId);
      setAlertId(defaultAlertId);
      setConfigId(defaultScanConfigId);
      setSshCredential(defaultSshCredential);
      setSmbCredential(defaultSmbCredential);
      setEsxiCredential(defaultEsxiCredential);
      setScannerId(defaultScannerId);
    });
    handleInteraction();
  };

  const handleCloseTaskWizard = () => {
    closeTaskWizard();
    handleInteraction();
  };

  const handleSaveTaskWizard = data => {
    const {onTaskWizardSaved, onTaskWizardError, gmp} = props;

    handleInteraction();

    return gmp.wizard
      .runQuickFirstScan(data)
      .then(onTaskWizardSaved, onTaskWizardError)
      .then(() => closeTaskWizard());
  };

  const openAdvancedTaskWizard = () => {
    const {
      gmp,
      timezone,
      defaultAlertId,
      defaultEsxiCredential,
      defaultPortListId,
      defaultScanConfigId = FULL_AND_FAST_SCAN_CONFIG_ID,
      defaultScannerId,
      defaultSshCredential,
      defaultSmbCredential,
    } = props;

    props.loadCredentials();
    props.loadScanConfigs();

    gmp.wizard.advancedTask().then(response => {
      const settings = response.data;

      const now = date().tz(timezone);

      toggleAdvancedTaskWizardVisible(true);
      setTaskName(_('New Quick Task'));
      setTargetHosts(settings.client_address);
      setPortListId(defaultPortListId);
      setAlertId(defaultAlertId);
      setConfigId(defaultScanConfigId);
      setSshCredential(defaultSshCredential);
      setSmbCredential(defaultSmbCredential);
      setEsxiCredential(defaultEsxiCredential);
      setScannerId(defaultScannerId);
      setStartDate(now);
      setStartMinute(now.minutes());
      setStartHour(now.hours());
      setTimezone(timezone);
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
    const {gmp, onAdvancedTaskWizardSaved, onAdvancedTaskWizardError} = props;

    handleInteraction();

    return gmp.wizard
      .runQuickTask(data)
      .then(onAdvancedTaskWizardSaved, onAdvancedTaskWizardError)
      .then(() => closeAdvancedTaskWizard());
  };

  const openModifyTaskWizard = () => {
    const {gmp, timezone} = props;

    gmp.wizard.modifyTask().then(response => {
      const settings = response.data;
      const now = date().tz(timezone);

      toggleModifyTaskWizardVisible(true);
      setTasks(settings.tasks);
      setReschedule(NO_VALUE);
      setTaskId(selectSaveId(settings.tasks));
      setStartDate(now);
      setStartMinute(now.minutes());
      setStartHour(now.hours());
      setTimezone(timezone);
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
    const {onModifyTaskWizardSaved, onModifyTaskWizardError, gmp} = props;

    handleInteraction();

    return gmp.wizard
      .runModifyTask(data)
      .then(onModifyTaskWizardSaved, onModifyTaskWizardError)
      .then(() => closeModifyTaskWizard());
  };

  const openReportImportDialog = task => {
    toggleReportImportDialogVisible(true);
    setTaskId(task.id);
    setTasks([task]);

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
    const {onReportImported, onReportImportError, gmp} = props;

    handleInteraction();

    return gmp.report
      .import(data)
      .then(onReportImported, onReportImportError)
      .then(() => closeReportImportDialog());
  };

  const handleScanConfigChange = config_id => {
    setConfigId(config_id);
  };

  const handleScannerChange = scanner_id => {
    setScannerId(scanner_id);
  };

  const {
    alerts,
    credentials,
    isLoadingAlerts,
    isLoadingSchedules,
    isLoadingTags,
    schedules,
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
  gmp: PropTypes.gmp.isRequired,
  isLoadingAlerts: PropTypes.bool,
  isLoadingConfigs: PropTypes.bool,
  isLoadingScanners: PropTypes.bool,
  isLoadingSchedules: PropTypes.bool,
  isLoadingTags: PropTypes.bool,
  isLoadingTargets: PropTypes.bool,
  loadAlerts: PropTypes.func.isRequired,
  loadCredentials: PropTypes.func.isRequired,
  loadScanConfigs: PropTypes.func.isRequired,
  loadScanners: PropTypes.func.isRequired,
  loadSchedules: PropTypes.func.isRequired,
  loadTags: PropTypes.func.isRequired,
  loadTargets: PropTypes.func.isRequired,
  loadUserSettingsDefaults: PropTypes.func.isRequired,
  scanConfigs: PropTypes.arrayOf(PropTypes.model),
  scanners: PropTypes.arrayOf(PropTypes.model),
  schedules: PropTypes.arrayOf(PropTypes.model),
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
  const alertSel = alertSelector(rootState);
  const credentialsSel = credentialsSelector(rootState);
  const userDefaults = getUserSettingsDefaults(rootState);
  const scanConfigsSel = scanConfigsSelector(rootState);
  const scannersSel = scannerSelector(rootState);
  const scheduleSel = scheduleSelector(rootState);
  const tagsSel = tagsSelector(rootState);
  const targetSel = targetSelector(rootState);
  return {
    timezone: getTimezone(rootState),
    alerts: alertSel.getEntities(ALL_FILTER),
    credentials: credentialsSel.getEntities(ALL_FILTER),
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
    isLoadingAlerts: alertSel.isLoadingAllEntities(ALL_FILTER),
    isLoadingConfigs: scanConfigsSel.isLoadingAllEntities(ALL_FILTER),
    isLoadingScanners: scannersSel.isLoadingAllEntities(ALL_FILTER),
    isLoadingSchedules: scheduleSel.isLoadingAllEntities(ALL_FILTER),
    isLoadingTags: tagsSel.isLoadingAllEntities(ALL_FILTER),
    isLoadingTargets: targetSel.isLoadingAllEntities(ALL_FILTER),
    scanConfigs: scanConfigsSel.getEntities(ALL_FILTER),
    scanners: scannersSel.getEntities(ALL_FILTER),
    schedules: scheduleSel.getEntities(ALL_FILTER),
    tags: tagsSel.getEntities(TAGS_FILTER),
    targets: targetSel.getEntities(ALL_FILTER),
  };
};

const mapDispatchToProp = (dispatch, {gmp}) => ({
  loadAlerts: () => dispatch(loadAlerts(gmp)(ALL_FILTER)),
  loadCredentials: () => dispatch(loadCredentials(gmp)(ALL_FILTER)),
  loadScanConfigs: () => dispatch(loadScanConfigs(gmp)(ALL_FILTER)),
  loadScanners: () => dispatch(loadScanners(gmp)(ALL_FILTER)),
  loadSchedules: () => dispatch(loadSchedules(gmp)(ALL_FILTER)),
  loadTags: () => dispatch(loadTags(gmp)(TAGS_FILTER)),
  loadTargets: () => dispatch(loadTargets(gmp)(ALL_FILTER)),
  loadUserSettingsDefaults: () => dispatch(loadUserSettingDefaults(gmp)()),
});

export default compose(
  withGmp,
  connect(mapStateToProps, mapDispatchToProp),
)(TaskComponent);

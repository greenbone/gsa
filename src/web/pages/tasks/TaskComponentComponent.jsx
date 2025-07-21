/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useState, useEffect, useCallback} from 'react';
import {useDispatch} from 'react-redux';
import date from 'gmp/models/date';
import {ALL_FILTER} from 'gmp/models/filter';
import {FULL_AND_FAST_SCAN_CONFIG_ID} from 'gmp/models/scanconfig';
import {OPENVAS_DEFAULT_SCANNER_ID} from 'gmp/models/scanner';
import {NO_VALUE} from 'gmp/parser';
import {map} from 'gmp/utils/array';
import {selectSaveId, hasId} from 'gmp/utils/id';
import {isDefined} from 'gmp/utils/identity';
import EntityComponent from 'web/entity/EntityComponent';
import actionFunction from 'web/entity/hooks/actionFunction';
import useGmp from 'web/hooks/useGmp';
import useShallowEqualSelector from 'web/hooks/useShallowEqualSelector';
import useTranslation from 'web/hooks/useTranslation';
import AlertComponent from 'web/pages/alerts/AlertComponent';
import ReportImportDialog from 'web/pages/reports/ReportImportDialog';
import ScheduleComponent from 'web/pages/schedules/ScheduleComponent';
import TargetComponent from 'web/pages/targets/Component';
import ContainerTaskDialog from 'web/pages/tasks/ContainerTaskDialog';
import TaskDialog from 'web/pages/tasks/TaskDialog';
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
import {loadUserSettingDefaults} from 'web/store/usersettings/defaults/actions';
import {getUserSettingsDefaults} from 'web/store/usersettings/defaults/selectors';
import {getTimezone} from 'web/store/usersettings/selectors';
import PropTypes from 'web/utils/PropTypes';
import {UNSET_VALUE} from 'web/utils/Render';
import AdvancedTaskWizard from 'web/wizard/AdvancedTaskWizard';
import ModifyTaskWizard from 'web/wizard/ModifyTaskWizard';
import TaskWizard from 'web/wizard/TaskWizard';

const TAGS_FILTER = ALL_FILTER.copy().set('resource_type', 'task');

const TaskComponent = ({
  children,
  onAdvancedTaskWizardError,
  onAdvancedTaskWizardSaved,
  onCloned,
  onCloneError,
  onContainerCreated,
  onContainerCreateError,
  onContainerSaved,
  onContainerSaveError,
  onCreated,
  onCreateError,
  onDeleted,
  onDeleteError,
  onDownloaded,
  onDownloadError,
  onInteraction,
  onModifyTaskWizardError,
  onModifyTaskWizardSaved,
  onReportImported,
  onReportImportError,
  onResumed,
  onResumeError,
  onSaved,
  onSaveError,
  onStarted,
  onStartError,
  onStopError,
  onStopped,
  onTaskWizardError,
  onTaskWizardSaved,
}) => {
  const gmp = useGmp();
  const [_] = useTranslation();
  const dispatch = useDispatch();

  const [advancedTaskWizardVisible, setAdvancedTaskWizardVisible] =
    useState(false);
  const [containerTaskDialogVisible, setContainerTaskDialogVisible] =
    useState(false);
  const [modifyTaskWizardVisible, setModifyTaskWizardVisible] = useState(false);
  const [reportImportDialogVisible, setReportImportDialogVisible] =
    useState(false);
  const [taskDialogVisible, setTaskDialogVisible] = useState(false);
  const [taskWizardVisible, setTaskWizardVisible] = useState(false);

  const [alertId, setAlertId] = useState();
  const [alertIds, setAlertIds] = useState([]);
  const [alterable, setAlterable] = useState();
  const [applyOverrides, setApplyOverrides] = useState();
  const [autoDelete, setAutoDelete] = useState();
  const [autoDeleteData, setAutoDeleteData] = useState();
  const [comment, setComment] = useState('');
  const [scanConfigId, setScanConfigId] = useState();
  const [esxiCredential, setEsxiCredential] = useState();
  const [hosts, setHosts] = useState();
  const [hostsOrdering, setHostsOrdering] = useState();
  const [id, setId] = useState();
  const [inAssets, setInAssets] = useState();
  const [maxChecks, setMaxChecks] = useState();
  const [maxHosts, setMaxHosts] = useState();
  const [minQod, setMinQod] = useState();
  const [name, setName] = useState('');
  const [reschedule, setReschedule] = useState();
  const [scannerId, setScannerId] = useState();
  const [scheduleId, setScheduleId] = useState();
  const [schedulePeriods, setSchedulePeriods] = useState();
  const [sshCredential, setSshCredential] = useState();
  const [smbCredential, setSmbCredential] = useState();
  const [startDate, setStartDate] = useState();
  const [startMinute, setStartMinute] = useState();
  const [startHour, setStartHour] = useState();
  const [startTimezone, setStartTimezone] = useState();
  const [tagId, setTagId] = useState();
  const [targetId, setTargetId] = useState();
  const [targetHosts, setTargetHosts] = useState();
  const [taskId, setTaskId] = useState();
  const [taskName, setTaskName] = useState();
  const [task, setTask] = useState();
  const [tasks, setTasks] = useState();
  const [title, setTitle] = useState('');

  const userDefaultsSelector = useShallowEqualSelector(getUserSettingsDefaults);

  const alerts = useShallowEqualSelector(state =>
    alertSelector(state).getEntities(ALL_FILTER),
  );

  const targets = useShallowEqualSelector(state =>
    targetSelector(state).getEntities(ALL_FILTER),
  );

  const schedules = useShallowEqualSelector(state =>
    scheduleSelector(state).getEntities(ALL_FILTER),
  );

  const scanConfigs = useShallowEqualSelector(state =>
    scanConfigsSelector(state).getEntities(ALL_FILTER),
  );

  const scanners = useShallowEqualSelector(state =>
    scannerSelector(state).getEntities(ALL_FILTER),
  );

  const timezone = useShallowEqualSelector(getTimezone);

  const credentials = useShallowEqualSelector(state =>
    credentialsSelector(state).getEntities(ALL_FILTER),
  );

  const tags = useShallowEqualSelector(state =>
    tagsSelector(state).getEntities(TAGS_FILTER),
  );

  const defaultAlertId = userDefaultsSelector.getValueByName('defaultalert');

  const defaultScheduleId =
    userDefaultsSelector.getValueByName('defaultschedule');

  const defaultTargetId = userDefaultsSelector.getValueByName('defaulttarget');

  const defaultEsxiCredential = userDefaultsSelector.getValueByName(
    'defaultesxicredential',
  );

  const defaultScanConfigId = userDefaultsSelector.getValueByName(
    'defaultopenvasscanconfig',
  );

  const defaultScannerId = userDefaultsSelector.getValueByName(
    'defaultopenvasscanner',
  );

  const defaultSshCredential = userDefaultsSelector.getValueByName(
    'defaultsshcredential',
  );

  const defaultSmbCredential = userDefaultsSelector.getValueByName(
    'defaultsmbcredential',
  );

  const isLoadingAlerts = useShallowEqualSelector(state =>
    alertSelector(state).isLoadingAllEntities(ALL_FILTER),
  );

  const isLoadingTargets = useShallowEqualSelector(state =>
    targetSelector(state).isLoadingAllEntities(ALL_FILTER),
  );

  const isLoadingSchedules = useShallowEqualSelector(state =>
    scheduleSelector(state).isLoadingAllEntities(ALL_FILTER),
  );

  const isLoadingScanners = useShallowEqualSelector(state =>
    scannerSelector(state).isLoadingAllEntities(ALL_FILTER),
  );

  const isLoadingTags = useShallowEqualSelector(state =>
    tagsSelector(state).isLoadingAllEntities(TAGS_FILTER),
  );

  const isLoadingConfigs = useShallowEqualSelector(state =>
    scanConfigsSelector(state).isLoadingAllEntities(ALL_FILTER),
  );

  const fetchAlerts = useCallback(
    () => dispatch(loadAlerts(gmp)(ALL_FILTER)),
    [dispatch, gmp],
  );

  const fetchScanners = useCallback(() => {
    dispatch(loadScanners(gmp)(ALL_FILTER));
  }, [dispatch, gmp]);

  const fetchSchedules = useCallback(() => {
    dispatch(loadSchedules(gmp)(ALL_FILTER));
  }, [dispatch, gmp]);

  const fetchTargets = useCallback(() => {
    dispatch(loadTargets(gmp)(ALL_FILTER));
  }, [dispatch, gmp]);

  const fetchTags = useCallback(() => {
    dispatch(loadTags(gmp)(TAGS_FILTER));
  }, [dispatch, gmp]);

  const fetchCredentials = useCallback(() => {
    dispatch(loadCredentials(gmp)(ALL_FILTER));
  }, [dispatch, gmp]);

  const fetchScanConfigs = useCallback(() => {
    dispatch(loadScanConfigs(gmp)(ALL_FILTER));
  }, [dispatch, gmp]);

  const fetchUserSettingsDefaults = useCallback(() => {
    dispatch(loadUserSettingDefaults(gmp)());
  }, [dispatch, gmp]);

  useEffect(() => {
    fetchUserSettingsDefaults();
  }, [fetchUserSettingsDefaults]);

  const handleInteraction = () => {
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
    handleInteraction();

    return actionFunction(
      gmp.task.start(task),
      onStarted,
      onStartError,
      _('Task {{name}} started successfully.', {name: task.name}),
    );
  };

  const handleTaskStop = task => {
    handleInteraction();

    return actionFunction(
      gmp.task.stop(task),
      onStopped,
      onStopError,
      _('Task {{name}} stopped successfully.', {name: task.name}),
    );
  };

  const handleTaskResume = task => {
    handleInteraction();

    return actionFunction(
      gmp.task.resume(task),
      onResumed,
      onResumeError,
      _('Task {{name}} resumed successfully.', {name: task.name}),
    );
  };

  const handleTaskWizardNewClick = () => {
    openTaskDialog();
    closeTaskWizard();
  };

  const handleAlertCreated = resp => {
    const {data} = resp;

    fetchAlerts();
    setAlertIds(prevAlertIds => [data.id, ...prevAlertIds]);
  };

  const handleScheduleCreated = resp => {
    const {data} = resp;

    fetchSchedules();

    setScheduleId(data.id);
  };

  const handleTargetCreated = resp => {
    const {data} = resp;

    fetchTargets();

    setTargetId(data.id);
  };

  const openContainerTaskDialog = task => {
    setContainerTaskDialogVisible(true);
    setTask(task);
    setName(task ? task.name : _('Unnamed'));
    setComment(task ? task.comment : '');
    setId(task ? task.id : undefined);
    setInAssets(task ? task.in_assets : undefined);
    setAutoDelete(task ? task.auto_delete : undefined);
    setAutoDeleteData(task ? task.auto_delete_data : undefined);
    setTitle(
      task ? _('Edit Container Task {{name}}', task) : _('New Container Task'),
    );
    handleInteraction();
  };

  const closeContainerTaskDialog = () => {
    setContainerTaskDialogVisible(false);
  };

  const handleCloseContainerTaskDialog = () => {
    closeContainerTaskDialog();
    handleInteraction();
  };

  const handleSaveContainerTask = data => {
    handleInteraction();

    if (isDefined(data.id)) {
      return gmp.task
        .saveContainer(data)
        .then(onContainerSaved, onContainerSaveError)
        .then(() => closeContainerTaskDialog());
    }

    return gmp.task
      .createContainer(data)
      .then(onContainerCreated, onContainerCreateError)
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
    tag_id,
    target_id,
    task,
  }) => {
    handleInteraction();

    if (isDefined(id)) {
      // save edit part
      if (isDefined(task) && !task.isChangeable()) {
        // arguments need to be undefined if the task is not changeable
        target_id = undefined;
        scanner_id = undefined;
        config_id = undefined;
      }
      return gmp.task
        .save({
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
          max_checks,
          max_hosts,
          min_qod,
          name,
          scanner_id,
          scanner_type,
          schedule_id,
          schedule_periods,
          target_id,
        })
        .then(onSaved, onSaveError)
        .then(() => closeTaskDialog());
    }

    return gmp.task
      .create({
        add_tag,
        alert_ids,
        alterable,
        apply_overrides,
        auto_delete,
        auto_delete_data,
        comment,
        config_id,
        hosts_ordering,
        in_assets,
        max_checks,
        max_hosts,
        min_qod,
        name,
        scanner_type,
        scanner_id,
        schedule_id,
        schedule_periods,
        tag_id,
        target_id,
      })
      .then(onCreated, onCreateError)
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
    setTaskDialogVisible(false);
  };

  const openStandardTaskDialog = task => {
    fetchAlerts();
    fetchScanConfigs();
    fetchScanners();
    fetchSchedules();
    fetchTargets();
    fetchTags();

    if (isDefined(task)) {
      setId(task.id);
      setName(task.name);
      setComment(task.comment);
      setAlterable(task.alterable);
      setApplyOverrides(task.apply_overrides);
      setInAssets(task.in_assets);
      setMinQod(task.min_qod);
      setAutoDelete(task.auto_delete);
      setAutoDeleteData(task.auto_delete_data);
      setMaxChecks(task.max_checks);
      setMaxHosts(task.max_hosts);
      setHostsOrdering(task.hosts_ordering);

      setScanConfigId(hasId(task.config) ? task.config.id : undefined);
      setScannerId(hasId(task.scanner) ? task.scanner.id : undefined);
      setScheduleId(isDefined(task.schedule) ? task.schedule.id : UNSET_VALUE);
      setSchedulePeriods(task.schedule_periods);
      setTargetId(hasId(task.target) ? task.target.id : undefined);

      const alIds = map(task.alerts, alert => alert.id);
      setAlertIds(alIds);

      setTask(task);
      setTitle(_('Edit Task {{name}}', {name: task.name}));
    } else {
      setId(undefined);
      setName(undefined);
      setComment(undefined);
      setAlterable(undefined);
      setApplyOverrides(undefined);
      setInAssets(undefined);
      setMinQod(undefined);
      setAutoDelete(undefined);
      setAutoDeleteData(undefined);
      setMaxChecks(undefined);
      setMaxHosts(undefined);
      setHostsOrdering(undefined);

      setScanConfigId(defaultScanConfigId || FULL_AND_FAST_SCAN_CONFIG_ID);
      setScannerId(defaultScannerId || OPENVAS_DEFAULT_SCANNER_ID);

      setScheduleId(defaultScheduleId);
      setSchedulePeriods(undefined);
      setTargetId(defaultTargetId);

      const alIds = isDefined(defaultAlertId) ? [defaultAlertId] : [];
      setAlertIds(alIds);

      setTagId(undefined);
      setTask(undefined);
      setTitle(_('New Task'));
    }

    setTaskDialogVisible(true);
    handleInteraction();
  };

  const openTaskWizard = () => {
    gmp.wizard.task().then(response => {
      const {data} = response;

      setTaskWizardVisible(true);
      setHosts(data.clientAddress);
    });
    handleInteraction();
  };

  const closeTaskWizard = () => {
    setTaskWizardVisible(false);
  };

  const handleSaveTaskWizard = data => {
    handleInteraction();

    return gmp.wizard
      .runQuickFirstScan(data)
      .then(onTaskWizardSaved, onTaskWizardError)
      .then(() => closeTaskWizard());
  };

  const openAdvancedTaskWizard = () => {
    fetchCredentials();
    fetchScanConfigs();

    gmp.wizard.advancedTask().then(response => {
      const {data} = response;

      const now = date().tz(timezone);
      setAdvancedTaskWizardVisible(true);
      setAlertId(defaultAlertId);
      setScanConfigId(defaultScanConfigId || FULL_AND_FAST_SCAN_CONFIG_ID);
      setEsxiCredential(defaultEsxiCredential);
      setScannerId(defaultScannerId);
      setSmbCredential(defaultSmbCredential);
      setSshCredential(defaultSshCredential);
      setStartDate(now);
      setStartHour(now.hour());
      setStartMinute(now.minute());
      setStartTimezone(timezone);
      setTargetHosts(data.clientAddress);
      setTaskName(_('New Quick Task'));
    });
    handleInteraction();
  };

  const closeAdvancedTaskWizard = () => {
    setAdvancedTaskWizardVisible(false);
  };

  const handleSaveAdvancedTaskWizard = data => {
    handleInteraction();

    return gmp.wizard
      .runQuickTask(data)
      .then(onAdvancedTaskWizardSaved, onAdvancedTaskWizardError)
      .then(() => closeAdvancedTaskWizard());
  };

  const openModifyTaskWizard = () => {
    gmp.wizard.modifyTask().then(response => {
      const {data} = response;
      const now = date().tz(timezone);

      setModifyTaskWizardVisible(true);
      setReschedule(NO_VALUE);
      setStartDate(now);
      setStartHour(now.hour());
      setStartMinute(now.minute());
      setStartTimezone(timezone);
      setTaskId(selectSaveId(data.tasks));
      setTasks(data.tasks);
    });
    handleInteraction();
  };

  const closeModifyTaskWizard = () => {
    setModifyTaskWizardVisible(false);
  };

  const handleSaveModifyTaskWizard = data => {
    handleInteraction();

    return gmp.wizard
      .runModifyTask(data)
      .then(onModifyTaskWizardSaved, onModifyTaskWizardError)
      .then(() => closeModifyTaskWizard());
  };

  const openReportImportDialog = task => {
    setReportImportDialogVisible(true);
    setTaskId(task.id);
    setTasks([task]);
    handleInteraction();
  };

  const closeReportImportDialog = () => {
    setReportImportDialogVisible(false);
  };

  const handleReportImport = data => {
    handleInteraction();

    return gmp.report
      .import(data)
      .then(onReportImported, onReportImportError)
      .then(() => closeReportImportDialog());
  };

  const handleScanConfigChange = configId => {
    setScanConfigId(configId);
  };

  const handleScannerChange = scannerId => {
    setScannerId(scannerId);
  };

  const handleCloseTaskDialog = () => {
    closeTaskDialog();
    handleInteraction();
  };

  const handleCloseTaskWizard = () => {
    closeTaskWizard();
    handleInteraction();
  };

  const handleCloseAdvancedTaskWizard = () => {
    closeAdvancedTaskWizard();
    handleInteraction();
  };

  const handleCloseModifyTaskWizard = () => {
    closeModifyTaskWizard();
    handleInteraction();
  };

  const handleCloseReportImportDialog = () => {
    closeReportImportDialog();
    handleInteraction();
  };

  return (
    <>
      <EntityComponent
        name="task"
        onCloneError={onCloneError}
        onCloned={onCloned}
        onCreateError={onCreateError}
        onCreated={onCreated}
        onDeleteError={onDeleteError}
        onDeleted={onDeleted}
        onDownloadError={onDownloadError}
        onDownloaded={onDownloaded}
        onInteraction={onInteraction}
      >
        {other => (
          <>
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
                            alert_ids={alertIds}
                            alerts={alerts}
                            alterable={alterable}
                            apply_overrides={applyOverrides}
                            auto_delete={autoDelete}
                            auto_delete_data={autoDeleteData}
                            comment={comment}
                            config_id={scanConfigId}
                            hosts_ordering={hostsOrdering}
                            id={id}
                            in_assets={inAssets}
                            isLoadingAlerts={isLoadingAlerts}
                            isLoadingConfigs={isLoadingConfigs}
                            isLoadingScanners={isLoadingScanners}
                            isLoadingSchedules={isLoadingSchedules}
                            isLoadingTags={isLoadingTags}
                            isLoadingTargets={isLoadingTargets}
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
                            tag_id={tagId}
                            tags={tags}
                            target_id={targetId}
                            targets={targets}
                            task={task}
                            title={title}
                            onAlertsChange={handleAlertsChange}
                            onClose={handleCloseTaskDialog}
                            onNewAlertClick={createalert}
                            onNewScheduleClick={createschedule}
                            onNewTargetClick={createtarget}
                            onSave={handleSaveTask}
                            onScanConfigChange={handleScanConfigChange}
                            onScannerChange={handleScannerChange}
                            onScheduleChange={handleScheduleChange}
                            onTargetChange={handleTargetChange}
                          />
                        )}
                      </ScheduleComponent>
                    )}
                  </AlertComponent>
                )}
              </TargetComponent>
            )}
          </>
        )}
      </EntityComponent>

      {containerTaskDialogVisible && (
        <ContainerTaskDialog
          auto_delete={autoDelete}
          auto_delete_data={autoDeleteData}
          comment={comment}
          id={id}
          in_assets={inAssets}
          name={name}
          task={task}
          title={title}
          onClose={handleCloseContainerTaskDialog}
          onSave={handleSaveContainerTask}
        />
      )}

      {taskWizardVisible && (
        <TaskWizard
          hosts={hosts}
          onClose={handleCloseTaskWizard}
          onNewClick={handleTaskWizardNewClick}
          onSave={handleSaveTaskWizard}
        />
      )}

      {advancedTaskWizardVisible && (
        <AdvancedTaskWizard
          alertId={alertId}
          credentials={credentials}
          esxiCredential={esxiCredential}
          scanConfigId={scanConfigId}
          scanConfigs={scanConfigs}
          smbCredential={smbCredential}
          sshCredential={sshCredential}
          startDate={startDate}
          startHour={startHour}
          startMinute={startMinute}
          startTimezone={startTimezone}
          targetHosts={targetHosts}
          taskName={taskName}
          onClose={handleCloseAdvancedTaskWizard}
          onSave={handleSaveAdvancedTaskWizard}
        />
      )}

      {modifyTaskWizardVisible && (
        <ModifyTaskWizard
          reschedule={reschedule}
          startDate={startDate}
          startHour={startHour}
          startMinute={startMinute}
          startTimezone={startTimezone}
          taskId={taskId}
          tasks={tasks}
          onClose={handleCloseModifyTaskWizard}
          onSave={handleSaveModifyTaskWizard}
        />
      )}

      {reportImportDialogVisible && (
        <ReportImportDialog
          newContainerTask={false}
          task_id={taskId}
          tasks={tasks}
          onClose={handleCloseReportImportDialog}
          onSave={handleReportImport}
        />
      )}
    </>
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

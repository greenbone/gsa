/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React, {useState, useEffect, useCallback, useMemo} from 'react';
import {useDispatch} from 'react-redux';
import {EntityActionData} from 'gmp/commands/entity';
import Rejection from 'gmp/http/rejection';
import Response from 'gmp/http/response';
import {XmlMeta} from 'gmp/http/transform/fastxml';
import date, {Date} from 'gmp/models/date';
import {ALL_FILTER} from 'gmp/models/filter';
import {FULL_AND_FAST_SCAN_CONFIG_ID} from 'gmp/models/scanconfig';
import {OPENVAS_DEFAULT_SCANNER_ID} from 'gmp/models/scanner';
import Task, {TaskAutoDelete, TaskHostsOrdering} from 'gmp/models/task';
import {NO_VALUE, YES_VALUE, YesNo} from 'gmp/parser';
import {DEFAULT_TIMEZONE} from 'gmp/timezones';
import {map} from 'gmp/utils/array';
import {selectSaveId} from 'gmp/utils/id';
import {isDefined} from 'gmp/utils/identity';
import EntityComponent from 'web/entity/EntityComponent';
import actionFunction from 'web/entity/hooks/actionFunction';
import {OnDownloadedFunc} from 'web/entity/hooks/useEntityDownload';
import useGmp from 'web/hooks/useGmp';
import {useGetAgentGroups} from 'web/hooks/useQuery/agentgroups';
import useShallowEqualSelector from 'web/hooks/useShallowEqualSelector';
import useTranslation from 'web/hooks/useTranslation';
import AgentGroupsComponent from 'web/pages/agent-groups/AgentGroupsComponent';
import AlertComponent from 'web/pages/alerts/AlertComponent';
import ImportReportDialog, {
  ReportImportDialogData,
} from 'web/pages/reports/ReportImportDialog';
import ScheduleComponent from 'web/pages/schedules/ScheduleComponent';
import TargetComponent from 'web/pages/targets/Component';
import AgentTaskDialog, {
  AgentTaskDialogData,
} from 'web/pages/tasks/AgentTaskDialog';
import ContainerTaskDialog, {
  ContainerTaskDialogData,
} from 'web/pages/tasks/ContainerTaskDialog';
import TaskDialog, {TaskDialogData} from 'web/pages/tasks/TaskDialog';
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
import {UNSET_VALUE} from 'web/utils/Render';
import AdvancedTaskWizard, {
  AdvancedTaskWizardData,
} from 'web/wizard/AdvancedTaskWizard';
import ModifyTaskWizard, {
  ModifyTaskWizardData,
} from 'web/wizard/ModifyTaskWizard';
import TaskWizard from 'web/wizard/TaskWizard';

interface TaskComponentRenderProps {
  create: () => void;
  createContainer: () => void;
  clone: (task: Task) => void;
  delete: (task: Task) => void;
  download: (task: Task) => void;
  save: (task: Task) => void;
  edit: (task: Task) => void;
  start: (task: Task) => void;
  stop: (task: Task) => void;
  resume: (task: Task) => void;
  reportImport: (task: Task) => void;
  advancedTaskWizard: () => void;
  modifyTaskWizard: () => void;
  taskWizard: () => void;
  onNewAgentTaskClick: () => void;
}

interface TaskComponentProps {
  children?: (props: TaskComponentRenderProps) => React.ReactNode;
  onAdvancedTaskWizardError?: (error: Error) => void;
  onAdvancedTaskWizardSaved?: () => void;
  onCloned?: (response: Response<EntityActionData, XmlMeta>) => void;
  onCloneError?: (error: Rejection) => void;
  onContainerCreated?: (response: Response<EntityActionData, XmlMeta>) => void;
  onContainerCreateError?: (error: Rejection) => void;
  onContainerSaved?: () => void;
  onContainerSaveError?: (error: Rejection) => void;
  onCreated?: (response: Response<EntityActionData, XmlMeta>) => void;
  onCreateError?: (error: Rejection) => void;
  onDeleted?: () => void;
  onDeleteError?: (error: Rejection) => void;
  onDownloaded?: OnDownloadedFunc;
  onDownloadError?: (error: Rejection) => void;
  onModifyTaskWizardError?: (error: Rejection) => void;
  onModifyTaskWizardSaved?: () => void;
  onReportImported?: () => void;
  onReportImportError?: (error: Rejection) => void;
  onResumed?: (response: Response<Task, XmlMeta>) => void;
  onResumeError?: (error: Rejection) => void;
  onSaved?: () => void;
  onSaveError?: (error: Rejection) => void;
  onStarted?: () => void;
  onStartError?: (error: Rejection) => void;
  onStopError?: (error: Rejection) => void;
  onStopped?: () => void;
  onTaskWizardError?: (error: Rejection) => void;
  onTaskWizardSaved?: () => void;
}

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
}: TaskComponentProps) => {
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
  const [agentTaskDialogVisible, setAgentTaskDialogVisible] = useState(false);

  const [alertIds, setAlertIds] = useState<string[]>([]);
  const [alterable, setAlterable] = useState<YesNo | undefined>();
  const [applyOverrides, setApplyOverrides] = useState<YesNo | undefined>();
  const [autoDelete, setAutoDelete] = useState<TaskAutoDelete | undefined>();
  const [autoDeleteData, setAutoDeleteData] = useState<number | undefined>();
  const [comment, setComment] = useState<string | undefined>();
  const [scanConfigId, setScanConfigId] = useState<string | undefined>();
  const [esxiCredential, setEsxiCredential] = useState();
  const [hosts, setHosts] = useState<string | undefined>();
  const [hostsOrdering, setHostsOrdering] = useState<
    TaskHostsOrdering | undefined
  >();
  const [inAssets, setInAssets] = useState<YesNo | undefined>();
  const [maxChecks, setMaxChecks] = useState<number | undefined>();
  const [maxHosts, setMaxHosts] = useState<number | undefined>();
  const [minQod, setMinQod] = useState<number | undefined>();
  const [name, setName] = useState<string | undefined>();
  const [reschedule, setReschedule] = useState<YesNo | undefined>();
  const [scannerId, setScannerId] = useState<string | undefined>();
  const [scheduleId, setScheduleId] = useState<string | undefined>();
  const [schedulePeriods, setSchedulePeriods] = useState<YesNo | undefined>();
  const [sshCredential, setSshCredential] = useState();
  const [smbCredential, setSmbCredential] = useState();
  const [startDate, setStartDate] = useState<Date>(date().tz(DEFAULT_TIMEZONE));
  const [startMinute, setStartMinute] = useState<number>(0);
  const [startHour, setStartHour] = useState<number>(0);
  const [startTimezone, setStartTimezone] = useState<string>(DEFAULT_TIMEZONE);
  const [targetId, setTargetId] = useState<string | undefined>();
  const [agentGroupId, setAgentGroupId] = useState<string | undefined>();
  const [targetHosts, setTargetHosts] = useState<string | undefined>();
  const [taskId, setTaskId] = useState<string | undefined>();
  const [taskName, setTaskName] = useState<string | undefined>();
  const [task, setTask] = useState<Task | undefined>();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState<string>('');

  const {data: agentGroupsData, isLoading: isAgentGroupsLoading} =
    useGetAgentGroups({filter: ALL_FILTER});

  const agentGroups = useMemo(
    () => agentGroupsData?.entities ?? [],
    [agentGroupsData],
  );

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
    // @ts-expect-error
    () => dispatch(loadAlerts(gmp)(ALL_FILTER)),
    [dispatch, gmp],
  );

  const fetchScanners = useCallback(() => {
    // @ts-expect-error
    dispatch(loadScanners(gmp)(ALL_FILTER));
  }, [dispatch, gmp]);

  const fetchSchedules = useCallback(() => {
    // @ts-expect-error
    dispatch(loadSchedules(gmp)(ALL_FILTER));
  }, [dispatch, gmp]);

  const fetchTargets = useCallback(() => {
    // @ts-expect-error
    dispatch(loadTargets(gmp)(ALL_FILTER));
  }, [dispatch, gmp]);

  const fetchTags = useCallback(() => {
    // @ts-expect-error
    dispatch(loadTags(gmp)(TAGS_FILTER));
  }, [dispatch, gmp]);

  const fetchCredentials = useCallback(() => {
    // @ts-expect-error
    dispatch(loadCredentials(gmp)(ALL_FILTER));
  }, [dispatch, gmp]);

  const fetchScanConfigs = useCallback(() => {
    // @ts-expect-error
    dispatch(loadScanConfigs(gmp)(ALL_FILTER));
  }, [dispatch, gmp]);

  const fetchUserSettingsDefaults = useCallback(() => {
    // @ts-expect-error
    dispatch(loadUserSettingDefaults(gmp)());
  }, [dispatch, gmp]);

  useEffect(() => {
    fetchUserSettingsDefaults();
  }, [fetchUserSettingsDefaults]);

  const handleTargetChange = (targetId?: string) => {
    setTargetId(targetId);
  };

  const handleAlertsChange = (alertIds: string[]) => {
    setAlertIds(alertIds);
  };

  const handleScheduleChange = (scheduleId?: string) => {
    setScheduleId(scheduleId);
  };

  const handleAgentGroupChange = (agentGroupId?: string) => {
    setAgentGroupId(agentGroupId);
  };

  const handleTaskStart = (task: Task) => {
    return actionFunction<void, Rejection>(
      // @ts-expect-error
      gmp.task.start(task),
      {
        onSuccess: onStarted,
        onError: onStartError,
        successMessage: _('Task {{name}} started successfully.', {
          name: task.name as string,
        }),
      },
    );
  };

  const handleTaskStop = (task: Task) => {
    return actionFunction<void, Rejection>(
      // @ts-expect-error
      gmp.task.stop(task),
      {
        onSuccess: onStopped,
        onError: onStopError,
        successMessage: _('Task {{name}} stopped successfully.', {
          name: task.name as string,
        }),
      },
    );
  };

  const handleTaskResume = (task: Task) => {
    return actionFunction<Response<Task, XmlMeta>, Rejection>(
      // @ts-expect-error
      gmp.task.resume(task),
      {
        onSuccess: onResumed,
        onError: onResumeError,
        successMessage: _('Task {{name}} resumed successfully.', {
          name: task.name as string,
        }),
      },
    );
  };

  const handleTaskWizardNewClick = () => {
    openTaskDialog();
    closeTaskWizard();
  };

  const handleAlertCreated = (resp: {data: {id: string}}) => {
    const {data} = resp;

    fetchAlerts();
    setAlertIds(prevAlertIds => [data.id, ...prevAlertIds]);
  };

  const handleScheduleCreated = (resp: {data: {id?: string}}) => {
    const {data} = resp;

    fetchSchedules();

    setScheduleId(data.id);
  };

  const handleTargetCreated = (resp: {data: {id?: string}}) => {
    const {data} = resp;

    fetchTargets();

    setTargetId(data.id);
  };

  const openContainerTaskDialog = (task?: Task) => {
    setContainerTaskDialogVisible(true);
    setTask(task);
    setName(task ? task.name : _('Unnamed'));
    setComment(task ? task.comment : '');
    setInAssets(task ? task.in_assets : undefined);
    setAutoDelete(task ? task.auto_delete : undefined);
    setAutoDeleteData(task ? task.auto_delete_data : undefined);
    setTitle(
      task
        ? _('Edit Container Task {{name}}', {name: task.name as string})
        : _('New Container Task'),
    );
  };

  const closeContainerTaskDialog = () => {
    setContainerTaskDialogVisible(false);
  };

  const handleCloseContainerTaskDialog = () => {
    closeContainerTaskDialog();
  };

  const handleSaveContainerTask = ({
    id,
    comment,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    in_assets,
    name,
  }: ContainerTaskDialogData) => {
    if (isDefined(id)) {
      return gmp.task
        .saveContainer({
          id,
          comment,
          in_assets,
          name,
        })
        .then(onContainerSaved, onContainerSaveError)
        .then(() => closeContainerTaskDialog());
    }

    return gmp.task
      .createContainer({
        comment,
        name,
      })
      .then(onContainerCreated, onContainerCreateError)
      .then(() => closeContainerTaskDialog());
  };

  const handleSaveTask = ({
    add_tag: addTag,
    alert_ids: alertIds,
    alterable,
    auto_delete: autoDelete,
    auto_delete_data: autoDeleteData,
    apply_overrides: applyOverrides,
    comment,
    config_id: configId,
    hosts_ordering: hostsOrdering,
    in_assets: inAssets,
    min_qod: minQod,
    max_checks: maxChecks,
    max_hosts: maxHosts,
    name,
    scanner_id: scannerId,
    scanner_type: scannerType,
    schedule_id: scheduleId,
    schedule_periods: schedulePeriods,
    tag_id: tagId,
    target_id: targetId,
    task,
  }: TaskDialogData) => {
    if (isDefined(task)) {
      // save edit part
      if (!task.isChangeable()) {
        // arguments need to be undefined if the task is not changeable
        targetId = undefined;
        scannerId = undefined;
        configId = undefined;
      }
      return gmp.task
        .save({
          alert_ids: alertIds,
          alterable,
          auto_delete: autoDelete,
          auto_delete_data: autoDeleteData,
          apply_overrides: applyOverrides,
          comment,
          config_id: configId,
          hosts_ordering: hostsOrdering,
          id: task.id as string,
          in_assets: inAssets,
          max_checks: maxChecks,
          max_hosts: maxHosts,
          min_qod: minQod,
          name,
          scanner_id: scannerId,
          scanner_type: scannerType,
          schedule_id: scheduleId,
          schedule_periods: schedulePeriods,
          target_id: targetId,
        })
        .then(onSaved, onSaveError)
        .then(() => closeTaskDialog());
    }
    return gmp.task
      .create({
        add_tag: addTag,
        alert_ids: alertIds,
        alterable,
        apply_overrides: applyOverrides,
        auto_delete: autoDelete,
        auto_delete_data: autoDeleteData,
        comment,
        config_id: configId,
        hosts_ordering: hostsOrdering,
        in_assets: inAssets,
        max_checks: maxChecks,
        max_hosts: maxHosts,
        min_qod: minQod,
        name,
        scanner_type: scannerType,
        scanner_id: scannerId,
        schedule_id: scheduleId,
        schedule_periods: schedulePeriods,
        tag_id: tagId,
        target_id: targetId,
      })
      .then(onCreated, onCreateError)
      .then(() => closeTaskDialog());
  };

  const handleSaveAgentTask = ({
    addTag,
    alertIds,
    alterable,
    autoDelete,
    autoDeleteData,
    applyOverrides,
    comment,
    inAssets,
    minQod,
    name,
    scheduleId,
    schedulePeriods,
    tagId,
    agentGroupId,
    task,
  }: AgentTaskDialogData) => {
    if (isDefined(task)) {
      // save edit part
      if (!task.isChangeable()) {
        // arguments need to be undefined if the task is not changeable
        agentGroupId = undefined;
      }
      return gmp.task
        .saveAgentGroupTask({
          alert_ids: alertIds,
          alterable,
          auto_delete: autoDelete,
          auto_delete_data: autoDeleteData,
          apply_overrides: applyOverrides,
          comment,
          id: task.id as string,
          in_assets: inAssets,
          min_qod: minQod,
          name,
          schedule_id: scheduleId,
          schedule_periods: schedulePeriods,
          agent_group_id: agentGroupId,
        })
        .then(onSaved, onSaveError)
        .then(() => closeAgentTaskDialog());
    }
    return gmp.task
      .createAgentGroupTask({
        add_tag: addTag,
        alert_ids: alertIds,
        alterable,
        apply_overrides: applyOverrides,
        auto_delete: autoDelete,
        auto_delete_data: autoDeleteData,
        comment,
        in_assets: inAssets,
        min_qod: minQod,
        name,
        schedule_id: scheduleId,
        schedule_periods: schedulePeriods,
        tag_id: tagId,
        agent_group_id: agentGroupId,
      })
      .then(onCreated, onCreateError)
      .then(() => closeAgentTaskDialog());
  };

  const openTaskDialog = (task?: Task) => {
    if (isDefined(task) && task.isContainer()) {
      openContainerTaskDialog(task);
    } else {
      if (task?.isAgent()) {
        openAgentTaskDialog(task);
      } else {
        openStandardTaskDialog(task);
      }
    }
  };

  const closeTaskDialog = () => {
    setTaskDialogVisible(false);
    setAgentTaskDialogVisible(false);
  };

  const openStandardTaskDialog = (task?: Task) => {
    fetchAlerts();
    fetchScanConfigs();
    fetchScanners();
    fetchSchedules();
    fetchTargets();
    fetchTags();

    if (isDefined(task)) {
      setName(task.name as string);
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

      setScanConfigId(task.config?.id);
      setScannerId(task.scanner?.id);
      setScheduleId(task.schedule?.id ?? UNSET_VALUE);
      setSchedulePeriods(
        task.schedule_periods === YES_VALUE ? YES_VALUE : NO_VALUE,
      );
      setTargetId(task.target?.id);

      setAlertIds(map(task.alerts, alert => alert.id as string));

      setTask(task);
      setTitle(_('Edit Task {{name}}', {name: task.name as string}));
    } else {
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

      setAlertIds(isDefined(defaultAlertId) ? [defaultAlertId] : []);

      setTask(undefined);
      setTitle(_('New Task'));
    }

    setTaskDialogVisible(true);
  };

  const openAgentTaskDialog = (task?: Task) => {
    fetchAlerts();
    fetchSchedules();
    fetchTargets();
    fetchTags();

    if (isDefined(task)) {
      setName(task.name as string);
      setComment(task.comment);
      setAlterable(task.alterable);
      setApplyOverrides(task.apply_overrides);
      setInAssets(task.in_assets);
      setMinQod(task.min_qod);
      setAutoDelete(task.auto_delete);
      setAutoDeleteData(task.auto_delete_data);

      setScheduleId(task.schedule?.id ?? UNSET_VALUE);
      setSchedulePeriods(
        task.schedule_periods === YES_VALUE ? YES_VALUE : NO_VALUE,
      );
      setAgentGroupId(task.agentGroup?.id);

      setAlertIds(map(task.alerts, alert => alert.id as string));

      setTask(task);
      setTitle(_('Edit Agent Task {{name}}', {name: task.name as string}));
    } else {
      setName(undefined);
      setComment(undefined);
      setAlterable(undefined);
      setApplyOverrides(undefined);
      setInAssets(undefined);
      setMinQod(undefined);
      setAutoDelete(undefined);
      setAutoDeleteData(undefined);

      setScheduleId(defaultScheduleId);
      setSchedulePeriods(undefined);
      setAgentGroupId(undefined);

      setAlertIds(isDefined(defaultAlertId) ? [defaultAlertId] : []);

      setTask(undefined);
      setTitle(_('New Agent Task'));
    }

    setAgentTaskDialogVisible(true);
  };

  const closeAgentTaskDialog = () => {
    setAgentTaskDialogVisible(false);
  };

  const openTaskWizard = () => {
    void gmp.wizard.task().then(response => {
      const {data} = response;

      setTaskWizardVisible(true);
      setHosts(data.clientAddress);
    });
  };

  const closeTaskWizard = () => {
    setTaskWizardVisible(false);
  };

  const handleSaveTaskWizard = (data: {hosts: string}) => {
    return gmp.wizard
      .runQuickFirstScan(data)
      .then(onTaskWizardSaved, onTaskWizardError)
      .then(() => closeTaskWizard());
  };

  const openAdvancedTaskWizard = () => {
    fetchCredentials();
    fetchScanConfigs();

    void gmp.wizard.advancedTask().then(response => {
      const {data} = response;

      const now = date().tz(timezone);
      setAdvancedTaskWizardVisible(true);
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
  };

  const closeAdvancedTaskWizard = () => {
    setAdvancedTaskWizardVisible(false);
  };

  const handleSaveAdvancedTaskWizard = (data: AdvancedTaskWizardData) => {
    return gmp.wizard
      .runQuickTask(data)
      .then(onAdvancedTaskWizardSaved, onAdvancedTaskWizardError)
      .then(() => closeAdvancedTaskWizard());
  };

  const openModifyTaskWizard = () => {
    void gmp.wizard.modifyTask().then(response => {
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
  };

  const closeModifyTaskWizard = () => {
    setModifyTaskWizardVisible(false);
  };

  const handleSaveModifyTaskWizard = (data: ModifyTaskWizardData) => {
    return gmp.wizard
      .runModifyTask(data)
      .then(onModifyTaskWizardSaved, onModifyTaskWizardError)
      .then(() => closeModifyTaskWizard());
  };

  const openReportImportDialog = (task: Task) => {
    setReportImportDialogVisible(true);
    setTaskId(task.id);
    setTasks([task]);
  };

  const closeReportImportDialog = () => {
    setReportImportDialogVisible(false);
  };

  const handleReportImport = (data: ReportImportDialogData) => {
    return (
      gmp.report
        // @ts-expect-error
        .import(data)
        .then(onReportImported, onReportImportError)
        .then(() => closeReportImportDialog())
    );
  };

  const handleScanConfigChange = (configId?: string) => {
    setScanConfigId(configId);
  };

  const handleScannerChange = (scannerId?: string) => {
    setScannerId(scannerId);
  };

  const handleCloseTaskDialog = () => {
    closeTaskDialog();
  };

  const handleCloseTaskWizard = () => {
    closeTaskWizard();
  };

  const handleCloseAdvancedTaskWizard = () => {
    closeAdvancedTaskWizard();
  };

  const handleCloseModifyTaskWizard = () => {
    closeModifyTaskWizard();
  };

  const handleCloseReportImportDialog = () => {
    closeReportImportDialog();
  };

  const handleOpenAgentTaskDialog = (task?: Task) => {
    openAgentTaskDialog(task);
  };

  const handleCloseNewAgentTaskDialog = () => {
    closeAgentTaskDialog();
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
      >
        {other => (
          <>
            {children &&
              children({
                ...other,
                create: openTaskDialog,
                createContainer: openContainerTaskDialog,
                edit: openTaskDialog,
                start: handleTaskStart,
                stop: handleTaskStop,
                resume: handleTaskResume,
                reportImport: openReportImportDialog,
                advancedTaskWizard: openAdvancedTaskWizard,
                modifyTaskWizard: openModifyTaskWizard,
                taskWizard: openTaskWizard,
                onNewAgentTaskClick: handleOpenAgentTaskDialog,
              })}

            {taskDialogVisible && (
              <TargetComponent onCreated={handleTargetCreated}>
                {({create: createTarget}) => (
                  // @ts-expect-error
                  <AlertComponent onCreated={handleAlertCreated}>
                    {({create: createAlert}) => (
                      <ScheduleComponent onCreated={handleScheduleCreated}>
                        {({create: createSchedule}) => (
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
                            tags={tags}
                            target_id={targetId}
                            targets={targets}
                            task={task}
                            title={title}
                            onAlertsChange={handleAlertsChange}
                            onClose={handleCloseTaskDialog}
                            onNewAlertClick={createAlert}
                            onNewScheduleClick={createSchedule}
                            onNewTargetClick={createTarget}
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
          comment={comment}
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
          taskId={taskId as string}
          tasks={tasks}
          onClose={handleCloseModifyTaskWizard}
          onSave={handleSaveModifyTaskWizard}
        />
      )}

      {reportImportDialogVisible && (
        <ImportReportDialog
          newContainerTask={false}
          task_id={taskId as string}
          tasks={tasks}
          onClose={handleCloseReportImportDialog}
          onSave={handleReportImport}
        />
      )}

      {agentTaskDialogVisible && (
        <AgentGroupsComponent>
          {({create: createAgentGroup}) => (
            // @ts-expect-error
            <AlertComponent onCreated={handleAlertCreated}>
              {({create: createAlert}) => (
                <ScheduleComponent onCreated={handleScheduleCreated}>
                  {({create: createSchedule}) => (
                    <AgentTaskDialog
                      agentGroupId={agentGroupId}
                      //@ts-ignore
                      agentGroups={agentGroups}
                      alertIds={alertIds}
                      alerts={alerts}
                      alterable={alterable}
                      applyOverrides={applyOverrides}
                      autoDelete={autoDelete}
                      autoDeleteData={autoDeleteData}
                      comment={comment}
                      inAssets={inAssets}
                      isLoadingAgentGroups={isAgentGroupsLoading}
                      isLoadingAlerts={isLoadingAlerts}
                      isLoadingSchedules={isLoadingSchedules}
                      isLoadingTags={isLoadingTags}
                      minQod={minQod}
                      name={name}
                      scheduleId={scheduleId}
                      schedulePeriods={schedulePeriods}
                      schedules={schedules}
                      tags={tags}
                      task={task}
                      title={title}
                      onAgentGroupChange={handleAgentGroupChange}
                      onAlertsChange={handleAlertsChange}
                      onClose={handleCloseNewAgentTaskDialog}
                      onNewAgentGroupClick={createAgentGroup}
                      onNewAlertClick={createAlert}
                      onNewScheduleClick={createSchedule}
                      onSave={handleSaveAgentTask}
                      onScheduleChange={handleScheduleChange}
                    />
                  )}
                </ScheduleComponent>
              )}
            </AlertComponent>
          )}
        </AgentGroupsComponent>
      )}
    </>
  );
};

export default TaskComponent;

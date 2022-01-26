/* Copyright (C) 2017-2022 Greenbone Networks GmbH
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
import React from 'react';

import {connect} from 'react-redux';

import _ from 'gmp/locale';

import {ALL_FILTER} from 'gmp/models/filter';

import {NO_VALUE} from 'gmp/parser';

import {map} from 'gmp/utils/array';
import {isDefined} from 'gmp/utils/identity';
import {selectSaveId, hasId} from 'gmp/utils/id';

import date from 'gmp/models/date';

import {FULL_AND_FAST_SCAN_CONFIG_ID} from 'gmp/models/scanconfig';

import {OPENVAS_DEFAULT_SCANNER_ID} from 'gmp/models/scanner';

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
import withCapabilities from 'web/utils/withCapabilities';
import withGmp from 'web/utils/withGmp';
import {UNSET_VALUE} from 'web/utils/render';

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

class TaskComponent extends React.Component {
  constructor(...args) {
    super(...args);

    this.state = {
      advancedTaskWizardVisible: false,
      containerTaskDialogVisible: false,
      modifyTaskWizardVisible: false,
      reportImportDialogVisible: false,
      taskDialogVisible: false,
      taskWizardVisible: false,
    };

    const {gmp} = this.props;

    this.cmd = gmp.task;

    this.handleReportImport = this.handleReportImport.bind(this);
    this.handleTaskResume = this.handleTaskResume.bind(this);
    this.handleSaveAdvancedTaskWizard =
      this.handleSaveAdvancedTaskWizard.bind(this);
    this.handleSaveTask = this.handleSaveTask.bind(this);
    this.handleSaveContainerTask = this.handleSaveContainerTask.bind(this);
    this.handleSaveModifyTaskWizard =
      this.handleSaveModifyTaskWizard.bind(this);
    this.handleSaveTaskWizard = this.handleSaveTaskWizard.bind(this);
    this.handleTaskStart = this.handleTaskStart.bind(this);
    this.handleTaskStop = this.handleTaskStop.bind(this);
    this.handleTaskWizardNewClick = this.handleTaskWizardNewClick.bind(this);

    this.openAdvancedTaskWizard = this.openAdvancedTaskWizard.bind(this);
    this.handleCloseAdvancedTaskWizard =
      this.handleCloseAdvancedTaskWizard.bind(this);
    this.openContainerTaskDialog = this.openContainerTaskDialog.bind(this);
    this.handleCloseContainerTaskDialog =
      this.handleCloseContainerTaskDialog.bind(this);
    this.openReportImportDialog = this.openReportImportDialog.bind(this);
    this.handleCloseReportImportDialog =
      this.handleCloseReportImportDialog.bind(this);
    this.openModifyTaskWizard = this.openModifyTaskWizard.bind(this);
    this.handleCloseModifyTaskWizard =
      this.handleCloseModifyTaskWizard.bind(this);
    this.openStandardTaskDialog = this.openStandardTaskDialog.bind(this);
    this.openTaskDialog = this.openTaskDialog.bind(this);
    this.handleCloseTaskDialog = this.handleCloseTaskDialog.bind(this);
    this.openTaskWizard = this.openTaskWizard.bind(this);
    this.handleCloseTaskWizard = this.handleCloseTaskWizard.bind(this);

    this.handleAlertsChange = this.handleAlertsChange.bind(this);
    this.handleTargetChange = this.handleTargetChange.bind(this);
    this.handleScheduleChange = this.handleScheduleChange.bind(this);

    this.handleAlertCreated = this.handleAlertCreated.bind(this);
    this.handleTargetCreated = this.handleTargetCreated.bind(this);
    this.handleScheduleCreated = this.handleScheduleCreated.bind(this);

    this.handleInteraction = this.handleInteraction.bind(this);

    this.handleScanConfigChange = this.handleScanConfigChange.bind(this);
    this.handleScannerChange = this.handleScannerChange.bind(this);
  }

  componentDidMount() {
    this.props.loadUserSettingsDefaults();
  }

  handleInteraction() {
    const {onInteraction} = this.props;
    if (isDefined(onInteraction)) {
      onInteraction();
    }
  }

  handleTargetChange(target_id) {
    this.setState({target_id});
  }

  handleAlertsChange(alert_ids) {
    this.setState({alert_ids});
  }

  handleScheduleChange(schedule_id) {
    this.setState({schedule_id});
  }

  handleTaskStart(task) {
    const {onStarted, onStartError} = this.props;

    this.handleInteraction();

    return this.cmd.start(task).then(onStarted, onStartError);
  }

  handleTaskStop(task) {
    const {onStopped, onStopError} = this.props;

    this.handleInteraction();

    return this.cmd.stop(task).then(onStopped, onStopError);
  }

  handleTaskResume(task) {
    const {onResumed, onResumeError} = this.props;

    this.handleInteraction();

    return this.cmd.resume(task).then(onResumed, onResumeError);
  }

  handleTaskWizardNewClick() {
    this.openTaskDialog();
    this.closeTaskWizard();
  }

  handleAlertCreated(resp) {
    const {data} = resp;

    this.props.loadAlerts();

    this.setState(({alert_ids}) => ({alert_ids: [data.id, ...alert_ids]}));
  }

  handleScheduleCreated(resp) {
    const {data} = resp;

    this.props.loadSchedules();

    this.setState({schedule_id: data.id});
  }

  handleTargetCreated(resp) {
    const {data} = resp;

    this.props.loadTargets();

    this.setState({target_id: data.id});
  }

  openContainerTaskDialog(task) {
    this.setState({
      containerTaskDialogVisible: true,
      task,
      name: task ? task.name : _('Unnamed'),
      comment: task ? task.comment : '',
      id: task ? task.id : undefined,
      in_assets: task ? task.in_assets : undefined,
      auto_delete: task ? task.auto_delete : undefined,
      auto_delete_data: task ? task.auto_delete_data : undefined,
      title: task
        ? _('Edit Container Task {{name}}', task)
        : _('New Container Task'),
    });
    this.handleInteraction();
  }

  closeContainerTaskDialog() {
    this.setState({containerTaskDialogVisible: false});
  }

  handleCloseContainerTaskDialog() {
    this.closeContainerTaskDialog();
    this.handleInteraction();
  }

  handleSaveContainerTask(data) {
    this.handleInteraction();

    if (isDefined(data.id)) {
      const {onContainerSaved, onContainerSaveError} = this.props;
      return this.cmd
        .saveContainer(data)
        .then(onContainerSaved, onContainerSaveError)
        .then(() => this.closeContainerTaskDialog());
    }

    const {onContainerCreated, onContainerCreateError} = this.props;
    return this.cmd
      .createContainer(data)
      .then(onContainerCreated, onContainerCreateError)
      .then(() => this.closeContainerTaskDialog());
  }

  handleSaveTask({
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
  }) {
    const {gmp} = this.props;

    this.handleInteraction();

    if (isDefined(id)) {
      // save edit part
      if (isDefined(task) && !task.isChangeable()) {
        // arguments need to be undefined if the task is not changeable
        target_id = undefined;
        scanner_id = undefined;
        config_id = undefined;
      }
      const {onSaved, onSaveError} = this.props;
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
        .then(() => this.closeTaskDialog());
    }

    const {onCreated, onCreateError} = this.props;
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
      .then(() => this.closeTaskDialog());
  }

  openTaskDialog(task) {
    if (isDefined(task) && task.isContainer()) {
      this.openContainerTaskDialog(task);
    } else {
      this.openStandardTaskDialog(task);
    }
  }

  closeTaskDialog() {
    this.setState({taskDialogVisible: false});
  }

  handleCloseTaskDialog() {
    this.closeTaskDialog();
    this.handleInteraction();
  }

  openStandardTaskDialog(task) {
    this.props.loadAlerts();
    this.props.loadScanConfigs();
    this.props.loadScanners();
    this.props.loadSchedules();
    this.props.loadTargets();
    this.props.loadTags();

    if (isDefined(task)) {
      this.setState({
        taskDialogVisible: true,
        alert_ids: map(task.alerts, alert => alert.id),
        alterable: task.alterable,
        apply_overrides: task.apply_overrides,
        auto_delete: task.auto_delete,
        auto_delete_data: task.auto_delete_data,
        comment: task.comment,
        config_id: hasId(task.config) ? task.config.id : undefined,
        hosts_ordering: task.hosts_ordering,
        id: task.id,
        in_assets: task.in_assets,
        max_checks: task.max_checks,
        max_hosts: task.max_hosts,
        min_qod: task.min_qod,
        name: task.name,
        scanner_id: hasId(task.scanner) ? task.scanner.id : undefined,
        schedule_id: isDefined(task.schedule) ? task.schedule.id : UNSET_VALUE,
        schedule_periods: task.schedule_periods,
        target_id: hasId(task.target) ? task.target.id : undefined,
        task,
        title: _('Edit Task {{name}}', task),
      });
    } else {
      const {
        defaultAlertId,
        defaultScanConfigId = FULL_AND_FAST_SCAN_CONFIG_ID,
        defaultScannerId = OPENVAS_DEFAULT_SCANNER_ID,
        defaultScheduleId,
        defaultTargetId,
      } = this.props;

      const alert_ids = isDefined(defaultAlertId) ? [defaultAlertId] : [];

      this.setState({
        taskDialogVisible: true,
        alert_ids,
        alterable: undefined,
        apply_overrides: undefined,
        auto_delete: undefined,
        auto_delete_data: undefined,
        comment: undefined,
        config_id: defaultScanConfigId,
        hosts_ordering: undefined,
        id: undefined,
        in_assets: undefined,
        max_checks: undefined,
        max_hosts: undefined,
        min_qod: undefined,
        name: undefined,
        scanner_id: defaultScannerId,
        schedule_id: defaultScheduleId,
        schedule_periods: undefined,
        target_id: defaultTargetId,
        task: undefined,
        title: _('New Task'),
      });
    }
    this.handleInteraction();
  }

  openTaskWizard() {
    const {
      gmp,
      defaultAlertId,
      defaultEsxiCredential,
      defaultPortListId,
      defaultScanConfigId,
      defaultScannerId,
      defaultSshCredential,
      defaultSmbCredential,
    } = this.props;

    gmp.wizard.task().then(response => {
      const settings = response.data;
      this.setState({
        taskWizardVisible: true,
        hosts: settings.client_address,
        port_list_id: defaultPortListId,
        alert_id: defaultAlertId,
        config_id: defaultScanConfigId,
        ssh_credential: defaultSshCredential,
        smb_credential: defaultSmbCredential,
        esxi_credential: defaultEsxiCredential,
        scanner_id: defaultScannerId,
      });
    });
    this.handleInteraction();
  }

  closeTaskWizard() {
    this.setState({taskWizardVisible: false});
  }

  handleCloseTaskWizard() {
    this.closeTaskWizard();
    this.handleInteraction();
  }

  handleSaveTaskWizard(data) {
    const {onTaskWizardSaved, onTaskWizardError, gmp} = this.props;

    this.handleInteraction();

    return gmp.wizard
      .runQuickFirstScan(data)
      .then(onTaskWizardSaved, onTaskWizardError)
      .then(() => this.closeTaskWizard());
  }

  openAdvancedTaskWizard() {
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
    } = this.props;

    this.props.loadCredentials();
    this.props.loadScanConfigs();

    gmp.wizard.advancedTask().then(response => {
      const settings = response.data;

      const now = date().tz(timezone);

      this.setState({
        advancedTaskWizardVisible: true,
        task_name: _('New Quick Task'),
        target_hosts: settings.client_address,
        port_list_id: defaultPortListId,
        alert_id: defaultAlertId,
        config_id: defaultScanConfigId,
        ssh_credential: defaultSshCredential,
        smb_credential: defaultSmbCredential,
        esxi_credential: defaultEsxiCredential,
        scanner_id: defaultScannerId,
        start_date: now,
        start_minute: now.minutes(),
        start_hour: now.hours(),
        start_timezone: timezone,
      });
    });
    this.handleInteraction();
  }

  closeAdvancedTaskWizard() {
    this.setState({advancedTaskWizardVisible: false});
  }

  handleCloseAdvancedTaskWizard() {
    this.closeAdvancedTaskWizard();
    this.handleInteraction();
  }

  handleSaveAdvancedTaskWizard(data) {
    const {gmp, onAdvancedTaskWizardSaved, onAdvancedTaskWizardError} =
      this.props;

    this.handleInteraction();

    return gmp.wizard
      .runQuickTask(data)
      .then(onAdvancedTaskWizardSaved, onAdvancedTaskWizardError)
      .then(() => this.closeAdvancedTaskWizard());
  }

  openModifyTaskWizard() {
    const {gmp, timezone} = this.props;

    gmp.wizard.modifyTask().then(response => {
      const settings = response.data;
      const now = date().tz(timezone);

      this.setState({
        modifyTaskWizardVisible: true,
        tasks: settings.tasks,
        reschedule: NO_VALUE,
        task_id: selectSaveId(settings.tasks),
        start_date: now,
        start_minute: now.minutes(),
        start_hour: now.hours(),
        start_timezone: timezone,
      });
    });
    this.handleInteraction();
  }

  closeModifyTaskWizard() {
    this.setState({modifyTaskWizardVisible: false});
  }

  handleCloseModifyTaskWizard() {
    this.closeModifyTaskWizard();
    this.handleInteraction();
  }

  handleSaveModifyTaskWizard(data) {
    const {onModifyTaskWizardSaved, onModifyTaskWizardError, gmp} = this.props;

    this.handleInteraction();

    return gmp.wizard
      .runModifyTask(data)
      .then(onModifyTaskWizardSaved, onModifyTaskWizardError)
      .then(() => this.closeModifyTaskWizard());
  }

  openReportImportDialog(task) {
    this.setState({
      reportImportDialogVisible: true,
      task_id: task.id,
      tasks: [task],
    });
    this.handleInteraction();
  }

  closeReportImportDialog() {
    this.setState({reportImportDialogVisible: false});
  }

  handleCloseReportImportDialog() {
    this.closeReportImportDialog();
    this.handleInteraction();
  }

  handleReportImport(data) {
    const {onReportImported, onReportImportError, gmp} = this.props;

    this.handleInteraction();

    return gmp.report
      .import(data)
      .then(onReportImported, onReportImportError)
      .then(() => this.closeReportImportDialog());
  }

  handleScanConfigChange(config_id) {
    this.setState({config_id});
  }

  handleScannerChange(scanner_id) {
    this.setState({scanner_id});
  }

  render() {
    const {
      alerts,
      credentials,
      isLoadingAlerts,
      isLoadingConfigs,
      isLoadingScanners,
      isLoadingSchedules,
      isLoadingTargets,
      isLoadingTags,
      scanConfigs,
      scanners,
      schedules,
      tags,
      targets,
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
    } = this.props;

    const {
      advancedTaskWizardVisible,
      alert_id,
      alert_ids,
      alterable,
      apply_overrides,
      auto_delete,
      auto_delete_data,
      config_id,
      containerTaskDialogVisible,
      comment,
      esxi_credential,
      hosts,
      hosts_ordering,
      id,
      in_assets,
      max_checks,
      max_hosts,
      min_qod,
      modifyTaskWizardVisible,
      name,
      port_list_id,
      reportImportDialogVisible,
      reschedule,
      scanner_id,
      schedule_id,
      schedule_periods,
      ssh_credential,
      smb_credential,
      start_date,
      start_minute,
      start_hour,
      start_timezone,
      tag_id,
      target_id,
      target_hosts,
      task_id,
      task_name,
      task,
      tasks,
      taskDialogVisible,
      taskWizardVisible,
      title = _('Edit Task {{name}}', task),
    } = this.state;
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
                create: this.openTaskDialog,
                createcontainer: this.openContainerTaskDialog,
                edit: this.openTaskDialog,
                start: this.handleTaskStart,
                stop: this.handleTaskStop,
                resume: this.handleTaskResume,
                reportimport: this.openReportImportDialog,
                advancedtaskwizard: this.openAdvancedTaskWizard,
                modifytaskwizard: this.openModifyTaskWizard,
                taskwizard: this.openTaskWizard,
              })}

              {taskDialogVisible && (
                <TargetComponent
                  onCreated={this.handleTargetCreated}
                  onInteraction={onInteraction}
                >
                  {({create: createtarget}) => (
                    <AlertComponent
                      onCreated={this.handleAlertCreated}
                      onInteraction={onInteraction}
                    >
                      {({create: createalert}) => (
                        <ScheduleComponent
                          onCreated={this.handleScheduleCreated}
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
                              tag_id={tag_id}
                              tags={tags}
                              target_id={target_id}
                              targets={targets}
                              task={task}
                              title={title}
                              onAlertsChange={this.handleAlertsChange}
                              onNewAlertClick={createalert}
                              onNewTargetClick={createtarget}
                              onNewScheduleClick={createschedule}
                              onScanConfigChange={this.handleScanConfigChange}
                              onScannerChange={this.handleScannerChange}
                              onScheduleChange={this.handleScheduleChange}
                              onTargetChange={this.handleTargetChange}
                              onClose={this.handleCloseTaskDialog}
                              onSave={this.handleSaveTask}
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
            onClose={this.handleCloseContainerTaskDialog}
            onSave={this.handleSaveContainerTask}
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
            onClose={this.handleCloseTaskWizard}
            onSave={this.handleSaveTaskWizard}
            onNewClick={this.handleTaskWizardNewClick}
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
            onClose={this.handleCloseAdvancedTaskWizard}
            onSave={this.handleSaveAdvancedTaskWizard}
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
            onClose={this.handleCloseModifyTaskWizard}
            onSave={this.handleSaveModifyTaskWizard}
          />
        )}

        {reportImportDialogVisible && (
          <ImportReportDialog
            newContainerTask={false}
            task_id={task_id}
            tasks={tasks}
            onClose={this.handleCloseReportImportDialog}
            onSave={this.handleReportImport}
          />
        )}
      </React.Fragment>
    );
  }
}

TaskComponent.propTypes = {
  alerts: PropTypes.arrayOf(PropTypes.model),
  capabilities: PropTypes.capabilities.isRequired,
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
  withCapabilities,
  connect(mapStateToProps, mapDispatchToProp),
)(TaskComponent);

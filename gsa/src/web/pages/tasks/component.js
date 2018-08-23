/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 * Steffen Waterkamp <steffen.waterkamp@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2017 - 2018 Greenbone Networks GmbH
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 */
import React from 'react';

import {connect} from 'react-redux';

import _ from 'gmp/locale';

import logger from 'gmp/log';

import {NO_VALUE} from 'gmp/parser';

import {first, forEach, map} from 'gmp/utils/array';
import {isArray, isDefined} from 'gmp/utils/identity';
import {includesId, selectSaveId} from 'gmp/utils/id';

import date from 'gmp/models/date';

import {
  FULL_AND_FAST_SCAN_CONFIG_ID,
  OPENVAS_SCAN_CONFIG_TYPE,
  OSP_SCAN_CONFIG_TYPE,
  filterEmptyScanConfig,
} from 'gmp/models/scanconfig';

import {
  OPENVAS_DEFAULT_SCANNER_ID,
} from 'gmp/models/scanner';

import {getTimezone} from 'web/store/usersettings/selectors';

import compose from 'web/utils/compose';
import PropTypes from 'web/utils/proptypes';
import withCapabilities from 'web/utils/withCapabilities';
import withGmp from 'web/utils/withGmp';
import {UNSET_VALUE} from 'web/utils/render';

import Wrapper from 'web/components/layout/wrapper';

import EntityComponent from 'web/entity/component';

import ImportReportDialog from 'web/pages/reports/importdialog';

import AdvancedTaskWizard from 'web/wizard/advancedtaskwizard';
import ModifyTaskWizard from 'web/wizard/modifytaskwizard';
import TaskWizard from 'web/wizard/taskwizard';

import ScheduleComponent from '../schedules/component.js';
import AlertComponent from '../alerts/component.js';
import TargetComponent from '../targets/component';

import TaskDialog from './dialog.js';
import ContainerTaskDialog from './containerdialog';

const log = logger.getLogger('web.tasks.component');

const sort_scan_configs = (scan_configs = []) => {
  const sorted_scan_configs = {
    [OPENVAS_SCAN_CONFIG_TYPE]: [],
    [OSP_SCAN_CONFIG_TYPE]: [],
  };

  scan_configs = scan_configs.filter(filterEmptyScanConfig);

  forEach(scan_configs, config => {
    const type = config.scan_config_type;
    if (!isArray(sorted_scan_configs[type])) {
      sorted_scan_configs[type] = [];
    }
    sorted_scan_configs[type].push(config);
  });
  return sorted_scan_configs;
};

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
    const {alert_ids} = this.state;

    const {gmp} = this.props;
    gmp.alerts.getAll().then(response => {
      const {data: alerts} = response;

      this.setState({alerts, alert_ids: [...alert_ids, data.id]});
    });
  }

  handleScheduleCreated(resp) {
    const {data} = resp;
    const {gmp} = this.props;

    return gmp.schedules.getAll().then(response => {
      const {data: schedules} = response;

      this.setState({
        schedules,
        schedule_id: data.id,
      });
    });
  }

  handleTargetCreated(resp) {
    const {data} = resp;
    const {gmp} = this.props;

    gmp.targets.getAll().then(reponse => {
      const {data: alltargets} = reponse;

      log.debug('adding target to task dialog', alltargets, data.id);

      this.setState({targets: alltargets, target_id: data.id});
    });
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
      title: task ? _('Edit Container Task {{name}}', task) :
        _('New Container Task'),
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
      return this.cmd.saveContainer(data)
        .then(onContainerSaved, onContainerSaveError)
        .then(() => this.closeContainerTaskDialog());
    }

    const {onContainerCreated, onContainerCreateError} = this.props;
    return this.cmd.createContainer(data)
      .then(onContainerCreated, onContainerCreateError)
      .then(() => this.closeContainerTaskDialog());
  }


  openTaskDialog(task) {
    if (isDefined(task) && task.isContainer()) {
      this.openContainerTaskDialog(task);
    }
    else {
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
    const {capabilities, gmp} = this.props;

    if (isDefined(task)) {
      gmp.task.editTaskSettings(task).then(response => {
        const settings = response.data;
        const {targets, scan_configs, alerts, scanners, schedules} = settings;

        log.debug('Loaded edit task dialog settings', task, settings);

        const sorted_scan_configs = sort_scan_configs(scan_configs);

        const canAccessSchedules = capabilities.mayAccess('schedules') &&
          isDefined(task.schedule);
        const schedule_id = canAccessSchedules ? task.schedule.id : UNSET_VALUE;
        const schedule_periods = canAccessSchedules ? task.schedule_periods :
          undefined;

        const data = {};
        if (task.isChangeable()) {
          data.config_id = isDefined(task.config) ? task.config.id : undefined;
          data.scanner_id = task.scanner.id;
          data.target_id = task.target.id;
        }
        else {
          data.config_id = UNSET_VALUE;
          data.scanner_id = UNSET_VALUE;
          data.target_id = UNSET_VALUE;

          // add UNSET_VALUEs to lists to be displayed with name in selects
          scanners.push({
            id: UNSET_VALUE,
            name: task.scanner.name,
          });
          targets.push({
            id: UNSET_VALUE,
            name: task.target.name,
          });
        }

        this.setState({
          taskDialogVisible: true,
          alert_ids: map(task.alerts, alert => alert.id),
          alerts,
          alterable: task.alterable,
          apply_overrides: task.apply_overrides,
          auto_delete: task.auto_delete,
          auto_delete_data: task.auto_delete_data,
          comment: task.comment,
          hosts_ordering: task.hosts_ordering,
          id: task.id,
          in_assets: task.in_assets,
          max_checks: task.max_checks,
          max_hosts: task.max_hosts,
          min_qod: task.min_qod,
          name: task.name,
          scan_configs: sorted_scan_configs,
          scanners,
          schedule_id,
          schedule_periods,
          schedules,
          source_iface: task.source_iface,
          targets,
          task,
          title: _('Edit Task {{name}}', task),
        });
      });
    }
    else {
      gmp.task.newTaskSettings().then(response => {
        const settings = response.data;
        let {
          schedule_id,
          alert_id,
          target_id,
          targets,
          scanner_id = OPENVAS_DEFAULT_SCANNER_ID,
          scan_configs,
          config_id = FULL_AND_FAST_SCAN_CONFIG_ID,
          alerts, scanners,
          schedules,
          tags,
        } = settings;

        log.debug('Loaded new task dialog settings', settings);

        const sorted_scan_configs = sort_scan_configs(scan_configs);

        scanner_id = selectSaveId(scanners, scanner_id);

        target_id = selectSaveId(targets, target_id);

        schedule_id = selectSaveId(schedules, schedule_id, UNSET_VALUE);

        alert_id = includesId(alerts, alert_id) ? alert_id : undefined;

        const alert_ids = isDefined(alert_id) ? [alert_id] : [];

        this.setState({
          taskDialogVisible: true,
          alert_ids,
          alerts,
          alterable: undefined,
          apply_overrides: undefined,
          auto_delete: undefined,
          auto_delete_data: undefined,
          comment: undefined,
          config_id,
          hosts_ordering: undefined,
          id: undefined,
          in_assets: undefined,
          max_checks: undefined,
          max_hosts: undefined,
          min_qod: undefined,
          name: undefined,
          scan_configs: sorted_scan_configs,
          scanners,
          scanner_id,
          schedule_id,
          schedule_periods: undefined,
          schedules,
          source_iface: undefined,
          tag_id: first(tags).id,
          tags,
          target_id,
          targets,
          task: undefined,
          title: _('New Task'),
        });
      });
    }
    this.handleInteraction();
  }

  openTaskWizard() {
    const {gmp} = this.props;

    gmp.wizard.task().then(response => {
      const settings = response.data;
      this.setState({
        taskWizardVisible: true,
        hosts: settings.client_address,
        port_list_id: settings.get('Default Port List').value,
        alert_id: settings.get('Default Alert').value,
        config_id: settings.get('Default OpenVAS Scan Config').value,
        ssh_credential: settings.get('Default SSH Credential').value,
        smb_credential: settings.get('Default SMB Credential').value,
        esxi_credential: settings.get('Default ESXi Credential').value,
        scanner_id: settings.get('Default OpenVAS Scanner').value,
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

    return gmp.wizard.runQuickFirstScan(data)
      .then(onTaskWizardSaved, onTaskWizardError)
      .then(() => this.closeTaskWizard());
  }


  openAdvancedTaskWizard() {
    const {
      gmp,
      timezone,
    } = this.props;

    gmp.wizard.advancedTask().then(response => {
      const settings = response.data;
      let config_id = settings.get('Default OpenVAS Scan Config').value;

      if (!isDefined(config_id) || config_id.length === 0) {
        config_id = FULL_AND_FAST_SCAN_CONFIG_ID;
      }

      const {credentials} = settings;

      const ssh_credential = selectSaveId(credentials,
        settings.get('Default SSH Credential').value, '');
      const smb_credential = selectSaveId(credentials,
        settings.get('Default SMB Credential').value, '');
      const esxi_credential = selectSaveId(credentials,
        settings.get('Default ESXi Credential').value, '');

      const now = date().tz(timezone);

      this.setState({
        advancedTaskWizardVisible: true,
        credentials,
        scan_configs: settings.scan_configs,
        task_name: _('New Quick Task'),
        target_hosts: settings.client_address,
        port_list_id: settings.get('Default Port List').value,
        alert_id: settings.get('Default Alert').value,
        config_id,
        ssh_credential,
        smb_credential,
        esxi_credential,
        scanner_id: settings.get('Default OpenVAS Scanner').value,
        slave_id: settings.get('Default Slave').value,
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
    const {
      gmp,
      onAdvancedTaskWizardSaved,
      onAdvancedTaskWizardError,
    } = this.props;

    this.handleInteraction();

    return gmp.wizard.runQuickTask(data)
      .then(onAdvancedTaskWizardSaved, onAdvancedTaskWizardError)
      .then(() => this.closeAdvancedTaskWizard());
  }

  openModifyTaskWizard() {
    const {
      gmp,
      timezone,
    } = this.props;

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

    return gmp.wizard.runModifyTask(data)
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

    return gmp.report.import(data)
      .then(onReportImported, onReportImportError)
      .then(() => this.closeReportImportDialog());
  }

  render() {
    const {
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
    } = this.props;

    const {
      advancedTaskWizardVisible,
      alert_id,
      alert_ids,
      alerts,
      alterable,
      apply_overrides,
      auto_delete,
      auto_delete_data,
      config_id,
      containerTaskDialogVisible,
      comment,
      credentials,
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
      scan_configs,
      scanner_id,
      scanners,
      schedule_id,
      schedule_periods,
      schedules,
      slave_id,
      source_iface,
      ssh_credential,
      smb_credential,
      start_date,
      start_minute,
      start_hour,
      start_timezone,
      tag_id,
      tags,
      target_id,
      target_hosts,
      targets,
      task_id,
      task_name,
      task,
      tasks,
      taskDialogVisible,
      taskWizardVisible,
      title = _('Edit Task {{name}}', task),
    } = this.state;

    return (
      <Wrapper>
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
          onSaved={onSaved}
          onSaveError={onSaveError}
        >
          {({
            save,
            ...other
          }) => (
            <Wrapper>
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

              {taskDialogVisible &&
                <TargetComponent
                  onCreated={this.handleTargetCreated}
                >
                  {({create: createtarget}) => (
                    <AlertComponent
                      onCreated={this.handleAlertCreated}
                    >
                      {({
                        create: createalert,
                      }) => (
                        <ScheduleComponent
                          onCreated={this.handleScheduleCreated}
                        >
                          {({
                            create: createschedule,
                          }) => (
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
                              in_assets={in_assets}
                              max_checks={max_checks}
                              max_hosts={max_hosts}
                              min_qod={min_qod}
                              name={name}
                              scan_configs={scan_configs}
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
                              onAlertsChange={this.handleAlertsChange}
                              onNewAlertClick={createalert}
                              onNewTargetClick={createtarget}
                              onNewScheduleClick={createschedule}
                              onScheduleChange={this.handleScheduleChange}
                              onTargetChange={this.handleTargetChange}
                              onClose={this.handleCloseTaskDialog}
                              onSave={d => {
                                this.handleInteraction();
                                return save(d)
                                  .then(() => this.closeTaskDialog());
                              }}
                            />
                          )}
                        </ScheduleComponent>
                      )}
                    </AlertComponent>
                  )}
                </TargetComponent>
              }
            </Wrapper>
          )}
        </EntityComponent>

        {containerTaskDialogVisible &&
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
        }

        {taskWizardVisible &&
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
        }

        {advancedTaskWizardVisible &&
          <AdvancedTaskWizard
            credentials={credentials}
            scan_configs={scan_configs}
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
            slave_id={slave_id}
            start_minute={start_minute}
            start_hour={start_hour}
            start_timezone={start_timezone}
            onClose={this.handleCloseAdvancedTaskWizard}
            onSave={this.handleSaveAdvancedTaskWizard}
          />
        }

        {modifyTaskWizardVisible &&
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
        }

        {reportImportDialogVisible &&
          <ImportReportDialog
            newContainerTask={false}
            task_id={task_id}
            tasks={tasks}
            onClose={this.handleCloseReportImportDialog}
            onSave={this.handleReportImport}
          />
        }
      </Wrapper>
    );
  }
}

TaskComponent.propTypes = {
  capabilities: PropTypes.capabilities.isRequired,
  children: PropTypes.func.isRequired,
  gmp: PropTypes.gmp.isRequired,
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
  onInteraction: PropTypes.func,
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

export default compose(
  withGmp,
  withCapabilities,
  connect(rootState => ({
    timezone: getTimezone(rootState),
  })),
)(TaskComponent);

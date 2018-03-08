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

import moment from 'moment-timezone';

import _ from 'gmp/locale.js';
import logger from 'gmp/log.js';
import {NO_VALUE} from 'gmp/parser';
import {first, for_each, map} from 'gmp/utils/array';
import {is_array, is_defined} from 'gmp/utils/identity';
import {includes_id, select_save_id} from 'gmp/utils/id';

import {
  FULL_AND_FAST_SCAN_CONFIG_ID,
  OPENVAS_SCAN_CONFIG_TYPE,
  OSP_SCAN_CONFIG_TYPE,
} from 'gmp/models/scanconfig.js';

import {
  OPENVAS_DEFAULT_SCANNER_ID,
} from 'gmp/models/scanner.js';

import PropTypes from '../../utils/proptypes.js';
import withCapabilities from '../../utils/withCapabilities';
import withGmp from '../../utils/withGmp';
import compose from '../../utils/compose';
import {UNSET_VALUE} from '../../utils/render';

import Wrapper from '../../components/layout/wrapper.js';

import EntityComponent from '../../entity/component.js';

import ImportReportDialog from '../reports/importdialog.js';

import AdvancedTaskWizard from '../../wizard/advancedtaskwizard.js';
import ModifyTaskWizard from '../../wizard/modifytaskwizard.js';
import TaskWizard from '../../wizard/taskwizard.js';

import TaskDialogContainer from './dialogcontainer.js';
import ContainerTaskDialog from './containerdialog.js';

const log = logger.getLogger('web.tasks.component');

const sort_scan_configs = scan_configs => {
  const sorted_scan_configs = {
    [OPENVAS_SCAN_CONFIG_TYPE]: [],
    [OSP_SCAN_CONFIG_TYPE]: [],
  };

  for_each(scan_configs, config => {
    const type = config.scan_config_type;
    if (!is_array(sorted_scan_configs[type])) {
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
    this.closeAdvancedTaskWizard = this.closeAdvancedTaskWizard.bind(this);
    this.openContainerTaskDialog = this.openContainerTaskDialog.bind(this);
    this.closeContainerTaskDialog = this.closeContainerTaskDialog.bind(this);
    this.openReportImportDialog = this.openReportImportDialog.bind(this);
    this.closeReportImportDialog = this.closeReportImportDialog.bind(this);
    this.openModifyTaskWizard = this.openModifyTaskWizard.bind(this);
    this.closeModifyTaskWizard = this.closeModifyTaskWizard.bind(this);
    this.openStandardTaskDialog = this.openStandardTaskDialog.bind(this);
    this.openTaskDialog = this.openTaskDialog.bind(this);
    this.closeTaskDialog = this.closeTaskDialog.bind(this);
    this.openTaskWizard = this.openTaskWizard.bind(this);
    this.closeTaskWizard = this.closeTaskWizard.bind(this);
  }

  handleSaveContainerTask(data) {
    if (is_defined(data.id)) {
      const {onContainerSaved, onContainerSaveError} = this.props;
      return this.cmd.saveContainer(data).then(onContainerSaved,
        onContainerSaveError);
    }

    const {onContainerCreated, onContainerCreateError} = this.props;
    return this.cmd.createContainer(data).then(onContainerCreated,
      onContainerCreateError);
  }

  handleReportImport(data) {
    const {onReportImported, onReportImportError, gmp} = this.props;

    return gmp.report.import(data).then(onReportImported, onReportImportError);
  }

  handleTaskStart(task) {
    const {onStarted, onStartError} = this.props;

    return this.cmd.start(task).then(onStarted, onStartError);
  }

  handleTaskStop(task) {
    const {onStopped, onStopError} = this.props;

    return this.cmd.stop(task).then(onStopped, onStopError);
  }

  handleTaskResume(task) {
    const {onResumed, onResumeError} = this.props;

    return this.cmd.resume(task).then(onResumed, onResumeError);
  }

  handleSaveTaskWizard(data) {
    const {onTaskWizardSaved, onTaskWizardError, gmp} = this.props;

    return gmp.wizard.runQuickFirstScan(data).then(onTaskWizardSaved,
      onTaskWizardError);
  }

  handleSaveAdvancedTaskWizard(data) {
    const {
      gmp,
      onAdvancedTaskWizardSaved,
      onAdvancedTaskWizardError,
    } = this.props;

    return gmp.wizard.runQuickTask(data).then(onAdvancedTaskWizardSaved,
      onAdvancedTaskWizardError);
  }

  handleSaveModifyTaskWizard(data) {
    const {onModifyTaskWizardSaved, onModifyTaskWizardError, gmp} = this.props;

    return gmp.wizard.runModifyTask(data).then(onModifyTaskWizardSaved,
      onModifyTaskWizardError);
  }

  handleTaskWizardNewClick() {
    this.openTaskDialog();
    this.closeTaskWizard();
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
  }

  closeContainerTaskDialog() {
    this.setState({containerTaskDialogVisible: false});
  }

  openTaskDialog(task) {
    if (is_defined(task) && task.isContainer()) {
      this.openContainerTaskDialog(task);
    }
    else {
      this.openStandardTaskDialog(task);
    }
  }

  closeTaskDialog() {
    this.setState({taskDialogVisible: false});
  }

  openStandardTaskDialog(task) {
    const {capabilities, gmp} = this.props;

    if (is_defined(task)) {
      gmp.task.editTaskSettings(task).then(response => {
        const settings = response.data;
        const {targets, scan_configs, alerts, scanners, schedules} = settings;

        log.debug('Loaded edit task dialog settings', task, settings);

        const sorted_scan_configs = sort_scan_configs(scan_configs);

        const schedule_id = capabilities.mayAccess('schedules') &&
          is_defined(task.schedule) ?
            task.schedule.id : UNSET_VALUE;

        const data = {};
        if (task.isChangeable()) {
          data.config_id = is_defined(task.config) ? task.config.id : undefined;
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
          schedules,
          source_iface: task.source_iface,
          targets,
          task,
          ...data,
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

        scanner_id = select_save_id(scanners, scanner_id);

        target_id = select_save_id(targets, target_id);

        schedule_id = select_save_id(schedules, schedule_id, UNSET_VALUE);

        alert_id = includes_id(alerts, alert_id) ? alert_id : undefined;

        const alert_ids = is_defined(alert_id) ? [alert_id] : [];

        this.setState({
          taskDialogVisible: true,
          alert_ids,
          alerts,
          config_id,
          scanners,
          scanner_id,
          scan_configs: sorted_scan_configs,
          schedule_id,
          schedules,
          tag_name: first(tags).name,
          tags,
          target_id,
          targets,
          title: _('New Task'),
        });
      });
    }
  }

  openReportImportDialog(task) {
    this.setState({
      reportImportDialogVisible: true,
      task_id: task.id,
      tasks: [task],
    });
  }

  closeReportImportDialog() {
    this.setState({reportImportDialogVisible: false});
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
  }

  closeTaskWizard() {
    this.setState({taskWizardVisible: false});
  }

  openAdvancedTaskWizard() {
    const {gmp} = this.props;

    gmp.wizard.advancedTask().then(response => {
      const settings = response.data;
      let config_id = settings.get('Default OpenVAS Scan Config').value;

      if (!is_defined(config_id) || config_id.length === 0) {
        config_id = FULL_AND_FAST_SCAN_CONFIG_ID;
      }

      const {credentials} = settings;

      const ssh_credential = select_save_id(credentials,
        settings.get('Default SSH Credential').value, '');
      const smb_credential = select_save_id(credentials,
        settings.get('Default SMB Credential').value, '');
      const esxi_credential = select_save_id(credentials,
        settings.get('Default ESXi Credential').value, '');

      const now = moment().tz(settings.timezone);

      this.setState({
        advancedTaskWizardVisible: true,
        credentials,
        scan_configs: settings.scan_configs,
        date: now,
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
        start_minute: now.minutes(),
        start_hour: now.hours(),
        start_timezone: settings.timezone,
      });
    });
  }

  closeAdvancedTaskWizard() {
    this.setState({advancedTaskWizardVisible: false});
  }

  openModifyTaskWizard() {
    const {gmp} = this.props;

    gmp.wizard.modifyTask().then(response => {
      const settings = response.data;
      const now = moment().tz(settings.timezone);

      this.setState({
        modifyTaskWizardVisible: true,
        date: now,
        tasks: settings.tasks,
        reschedule: NO_VALUE,
        task_id: select_save_id(settings.tasks),
        start_minute: now.minutes(),
        start_hour: now.hours(),
        start_timezone: settings.timezone,
      });
    });
  }

  closeModifyTaskWizard() {
    this.setState({modifyTaskWizardVisible: false});
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
      date,
      esxi_credential,
      hosts,
      id,
      in_assets,
      min_qod,
      modifyTaskWizardVisible,
      name,
      port_list_id,
      reportImportDialogVisible,
      reschedule,
      scan_configs,
      scanner_id,
      scanner_type,
      scanners,
      schedule_id,
      schedules,
      slave_id,
      ssh_credential,
      smb_credential,
      start_minute,
      start_hour,
      start_timezone,
      target_hosts,
      targets,
      task_id,
      task_name,
      task,
      tasks,
      taskDialogVisible,
      taskWizardVisible,
      title = _('Edit Task {{name}}', task),
      ...data
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
                <TaskDialogContainer
                  alert_ids={alert_ids}
                  alerts={alerts}
                  alterable={alterable}
                  apply_overrides={apply_overrides}
                  auto_delete={auto_delete}
                  auto_delete_data={auto_delete_data}
                  comment={comment}
                  config_id={config_id}
                  id={id}
                  in_assets={in_assets}
                  min_qod={min_qod}
                  name={name}
                  scan_configs={scan_configs}
                  scanner_type={scanner_type}
                  scanners={scanners}
                  scanner_id={scanner_id}
                  schedule_id={schedule_id}
                  schedules={schedules}
                  targets={targets}
                  task={task}
                  title={title}
                  {...data}
                  onClose={this.closeTaskDialog}
                  onSave={save}
                />
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
            onClose={this.closeContainerTaskDialog}
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
            onClose={this.closeTaskWizard}
            onSave={this.handleSaveTaskWizard}
            onNewClick={this.handleTaskWizardNewClick}
          />
        }

        {advancedTaskWizardVisible &&
          <AdvancedTaskWizard
            credentials={credentials}
            scan_configs={scan_configs}
            date={date}
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
            onClose={this.closeAdvancedTaskWizard}
            onSave={this.handleSaveAdvancedTaskWizard}
          />
        }

        {modifyTaskWizardVisible &&
          <ModifyTaskWizard
            date={date}
            tasks={tasks}
            reschedule={reschedule}
            task_id={task_id}
            start_minute={start_minute}
            start_hour={start_hour}
            start_timezone={start_timezone}
            onClose={this.closeModifyTaskWizard}
            onSave={this.handleSaveModifyTaskWizard}
          />
        }

        {reportImportDialogVisible &&
          <ImportReportDialog
            newContainerTask={false}
            task_id={task_id}
            tasks={tasks}
            onClose={this.closeReportImportDialog}
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
)(TaskComponent);

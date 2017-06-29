/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2016 - 2017 Greenbone Networks GmbH
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

import  _ from '../../locale.js';
import logger from '../../log.js';
import {
  first,
  for_each,
  includes_id,
  is_array,
  is_defined,
  is_empty,
  map,
  select_save_id,
} from '../../utils.js';

import PropTypes from '../utils/proptypes.js';

import EntitiesPage from '../entities/page.js';
import {withEntitiesContainer} from '../entities/container.js';

import ImportReportDialog from '../reports/importdialog.js';

import AdvancedTaskWizard from '../wizard/advancedtaskwizard.js';
import ModifyTaskWizard from '../wizard/modifytaskwizard.js';
import TaskWizard from '../wizard/taskwizard.js';

import TaskDialog from './dialogcontainer.js';
import ContainerTaskDialog from './containerdialog.js';
import TaskFilterDialog from './filterdialog.js';
import TaskCharts from './charts.js';
import Table from './table.js';

import {withDashboard} from '../components/dashboard/dashboard.js';

import HelpIcon from '../components/icon/helpicon.js';

import IconDivider from '../components/layout/icondivider.js';
import Layout from '../components/layout/layout.js';

import IconMenu from '../components/menu/iconmenu.js';
import MenuEntry from '../components/menu/menuentry.js';

import NewIconMenu from './icons/newiconmenu.js';

import {TASKS_FILTER_FILTER} from '../../gmp/models/filter.js';

import {
  OPENVAS_DEFAULT_SCANNER_ID,
} from '../../gmp/models/scanner.js';

import {
  FULL_AND_FAST_SCAN_CONFIG_ID,
  OPENVAS_SCAN_CONFIG_TYPE,
  OSP_SCAN_CONFIG_TYPE,
} from '../../gmp/models/scanconfig.js';

const log = logger.getLogger('web.tasks.taskspage');

const sort_scan_configs = scan_configs => {
  let sorted_scan_configs = {
    [OPENVAS_SCAN_CONFIG_TYPE]: [],
    [OSP_SCAN_CONFIG_TYPE]: [],
  };

  for_each(scan_configs, config => {
    let {type} = config;
    if (!is_array(sorted_scan_configs[type])) {
      sorted_scan_configs[type] = [];
    }
    sorted_scan_configs[type].push(config);
  });
  return sorted_scan_configs;
};

const Dashboard = withDashboard(TaskCharts, {
  hideFilterSelect: true,
  configPrefId: '3d5db3c7-5208-4b47-8c28-48efc621b1e0',
  defaultControllersString: 'task-by-severity-class|' +
    'task-by-most-high-results|task-by-status',
  defaultControllerString: 'task-by-cvss',
});

const ToolBarIcons = ({
    onAdvancedTaskWizardClick,
    onModifyTaskWizardClick,
    onNewContainerTaskClick,
    onNewTaskClick,
    onTaskWizardClick,
  }, {capabilities}) => {
  return (
    <IconDivider>
      <HelpIcon
        page="tasks"
        title={_('Help: Tasks')}/>
      {capabilities.mayOp('run_wizard') &&
        <IconMenu img="wizard.svg" size="small"
          onClick={onTaskWizardClick}>
          {capabilities.mayCreate('task') &&
            <MenuEntry title={_('Task Wizard')}
              onClick={onTaskWizardClick}/>
          }
          {capabilities.mayCreate('task') &&
            <MenuEntry title={_('Advanced Task Wizard')}
              onClick={onAdvancedTaskWizardClick}/>
          }
          {capabilities.mayEdit('task') &&
            <MenuEntry title={_('Modify Task Wizard')}
              onClick={onModifyTaskWizardClick}/>
          }
        </IconMenu>
      }

      <NewIconMenu
        onNewClick={onNewTaskClick}
        onNewContainerClick={onNewContainerTaskClick}/>

    </IconDivider>
  );
};

ToolBarIcons.contextTypes = {
  capabilities: PropTypes.capabilities.isRequired,
};

ToolBarIcons.propTypes = {
  onAdvancedTaskWizardClick: PropTypes.func.isRequired,
  onModifyTaskWizardClick: PropTypes.func.isRequired,
  onNewContainerTaskClick: PropTypes.func.isRequired,
  onNewTaskClick: PropTypes.func.isRequired,
  onTaskWizardClick: PropTypes.func.isRequired,
};

class Page extends React.Component {

  constructor(...args) {
    super(...args);

    this.handleImportReport = this.handleImportReport.bind(this);
    this.handleResumeTask = this.handleResumeTask.bind(this);
    this.handleSaveAdvancedTaskWizard =
      this.handleSaveAdvancedTaskWizard.bind(this);
    this.handleSaveContainerTask = this.handleSaveContainerTask.bind(this);
    this.handleSaveModifyTaskWizard =
      this.handleSaveModifyTaskWizard.bind(this);
    this.handleSaveTaskWizard = this.handleSaveTaskWizard.bind(this);
    this.handleStartTask = this.handleStartTask.bind(this);
    this.handleStopTask = this.handleStopTask.bind(this);
    this.handleTaskWizardNewClick = this.handleTaskWizardNewClick.bind(this);
    this.openAdvancedTaskWizard = this.openAdvancedTaskWizard.bind(this);
    this.openContainerTaskDialog = this.openContainerTaskDialog.bind(this);
    this.openImportReportDialog = this.openImportReportDialog.bind(this);
    this.openModifyTaskWizard = this.openModifyTaskWizard.bind(this);
    this.openStandardTaskDialog = this.openStandardTaskDialog.bind(this);
    this.openTaskDialog = this.openTaskDialog.bind(this);
    this.openTaskWizard = this.openTaskWizard.bind(this);
  }

  handleSaveContainerTask(data) {
    let {entityCommand, onChanged} = this.props;
    let promise;

    if (is_defined(data.task)) {
      promise = entityCommand.saveContainer(data);
    }
    else {
      promise = entityCommand.createContainer(data);
    }

    return promise.then(() => onChanged());
  }

  handleImportReport(data) {
    let {gmp} = this.context;
    let {onChanged} = this.props;
    return gmp.report.import(data).then(() => onChanged());
  }

  handleStartTask(task) {
    let {entityCommand, onChanged} = this.props;
    entityCommand.start(task).then(() => onChanged());
  }

  handleStopTask(task) {
    let {entityCommand, onChanged} = this.props;
    entityCommand.stop(task).then(() => onChanged());
  }

  handleResumeTask(task) {
    let {entityCommand, onChanged} = this.props;
    entityCommand.resume(task).then(() => onChanged());
  }

  handleSaveTaskWizard(data) {
    let {gmp} = this.context;
    let {onChanged} = this.props;
    return gmp.wizard.runQuickFirstScan(data).then(() => onChanged());
  }

  handleSaveAdvancedTaskWizard(data) {
    let {gmp} = this.context;
    let {onChanged} = this.props;
    return gmp.wizard.runQuickTask(data).then(() => onChanged());
  }

  handleSaveModifyTaskWizard(data) {
    let {gmp} = this.context;
    let {onChanged} = this.props;
    return gmp.wizard.runModifyTask(data).then(() => onChanged());
  }

  handleTaskWizardNewClick() {
    this.openTaskDialog();
    this.task_wizard.close();
  }

  openContainerTaskDialog(task) {
    this.container_dialog.show({
      task,
      name: task ? task.name : _('unnamed'),
      comment: task ? task.comment : '',
      id: task ? task.id : undefined,
      in_assets: task ? task.in_assets : undefined,
      auto_delete: task ? task.auto_delete : undefined,
      auto_delete_data: task ? task.auto_delete_data : undefined,
    }, {
      title: task ? _('Edit Container Task {{name}}', task) :
        _('New Container Task'),
    });
  }

  openTaskDialog(task) {
    if (is_defined(task) && task.isContainer()) {
      this.openContainerTaskDialog(task);
    }
    else {
      this.openStandardTaskDialog(task);
    }
  }

  openStandardTaskDialog(task) {
    let {capabilities} = this.context;
    let {entityCommand} = this.props;

    if (task) {
      entityCommand.editTaskSettings(task).then(response => {
        let settings = response.data;
        let {targets, scan_configs, alerts, scanners, schedules} = settings;

        log.debug('Loaded edit task dialog settings', settings);

        let sorted_scan_configs = sort_scan_configs(scan_configs);

        let schedule_id;
        if (capabilities.mayOp('get_schedules') &&
          !is_empty(task.schedule.id)) {
          schedule_id = task.schedule.id;
        }
        else {
          schedule_id = 0;
        }

        this.task_dialog.show({
          alert_ids: map(task.alerts, alert => alert.id),
          alerts,
          alterable: task.alterable,
          apply_overrides: task.apply_overrides,
          auto_delete: task.auto_delete,
          auto_delete_data: task.auto_delete_data,
          comment: task.comment,
          config_id: task.isAlterable() ? task.config.id : '0',
          id: task.id,
          in_assets: task.in_assets,
          min_qod: task.min_qod,
          name: task.name,
          scan_configs: sorted_scan_configs,
          scanner_id: task.isAlterable() ? task.scanner.id : '0',
          scanner_type: task.scanner.type,
          scanners,
          schedule_id,
          schedules,
          target_id: task.isAlterable() ?  task.target.id : '0',
          targets,
          task: task,
        }, {
          title: _('Edit Task {{name}}', task),
        });
      });
    }
    else {
      entityCommand.newTaskSettings().then(response => {
        let settings = response.data;
        let {schedule_id, alert_id, target_id,
          targets, scanner_id = OPENVAS_DEFAULT_SCANNER_ID, scan_configs,
          config_id = FULL_AND_FAST_SCAN_CONFIG_ID, alerts, scanners,
          schedules, tags} = settings;

        log.debug('Loaded new task dialog settings', settings);

        let sorted_scan_configs = sort_scan_configs(scan_configs);

        scanner_id = select_save_id(scanners, scanner_id);

        target_id = select_save_id(targets, target_id);

        schedule_id = select_save_id(schedules, schedule_id, '0');

        alert_id = includes_id(alerts, alert_id) ? alert_id : undefined;

        let alert_ids = is_defined(alert_id) ? [alert_id] : [];

        this.task_dialog.show({
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
        }, {
          title: _('New Task'),
        });
      });
    }
  }

  openImportReportDialog(task) {
    this.import_report_dialog.show({
      task_id: task.id,
      tasks: [task],
    });
  }

  openTaskWizard() {
    let {gmp} = this.context;

    this.task_wizard.show({});

    gmp.wizard.task().then(response => {
      let settings = response.data;
      this.task_wizard.setValues({
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

  openAdvancedTaskWizard() {
    let {gmp} = this.context;
    gmp.wizard.advancedTask().then(response => {
      let settings = response.data;
      let config_id = settings.get('Default OpenVAS Scan Config').value;

      if (!is_defined(config_id) || config_id.length === 0) {
        config_id = FULL_AND_FAST_SCAN_CONFIG_ID;
      }

      let credentials = settings.credentials;

      let ssh_credential = select_save_id(credentials,
        settings.get('Default SSH Credential').value, '');
      let smb_credential = select_save_id(credentials,
        settings.get('Default SMB Credential').value, '');
      let esxi_credential = select_save_id(credentials,
        settings.get('Default ESXi Credential').value, '');

      let now = moment().tz(settings.timezone);

      this.advanced_task_wizard.show({
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

  openModifyTaskWizard() {
    let {gmp} = this.context;

    gmp.wizard.modifyTask().then(response => {
      let settings = response.data;
      let now = moment().tz(settings.timezone);

      this.modify_task_wizard.show({
        date: now,
        tasks: settings.tasks,
        reschedule: '0',
        task_id: select_save_id(settings.tasks),
        start_minute: now.minutes(),
        start_hour: now.hours(),
        start_timezone: settings.timezone,
      });
    });
  }

  render() {
    let {capabilities} = this.context;
    let {onChanged} = this.props;

    return (
      <Layout>
        <EntitiesPage
          {...this.props}
          onAdvancedTaskWizardClick={this.openAdvancedTaskWizard}
          onEditTaskClick={this.openTaskDialog}
          onImportReportClick={this.openImportReportDialog}
          onModifyTaskWizardClick={this.openModifyTaskWizard}
          onNewContainerTaskClick={this.openContainerTaskDialog}
          onNewTaskClick={this.openTaskDialog}
          onResumeTaskClick={this.handleResumeTask}
          onStartTaskClick={this.handleStartTask}
          onStopTaskClick={this.handleStopTask}
          onTaskWizardClick={this.openTaskWizard}
        />

        {capabilities.mayCreate('task') &&
          <span>
            <TaskDialog
              ref={ref => this.task_dialog = ref}
              onSave={onChanged}/>
            <ContainerTaskDialog
              ref={ref => this.container_dialog = ref}
              onSave={this.handleSaveContainerTask}/>
          </span>
        }

        {capabilities.mayOp('run_wizard') &&
          capabilities.mayCreate('task') &&
          <span>
            <TaskWizard
              ref={ref => this.task_wizard = ref}
              onSave={this.handleSaveTaskWizard}
              onNewClick={this.handleTaskWizardNewClick}/>
            <AdvancedTaskWizard
              ref={ref => this.advanced_task_wizard = ref}
              onSave={this.handleSaveAdvancedTaskWizard}/>
          </span>
        }
        {capabilities.mayOp('run_wizard') &&
          capabilities.mayEdit('task') &&
            <ModifyTaskWizard
              ref={ref => this.modify_task_wizard = ref}
              onSave={this.handleSaveModifyTaskWizard}/>
        }

        {capabilities.mayCreate('report') &&
          <ImportReportDialog
            ref={ref => this.import_report_dialog = ref}
            newContainerTask={false}
            onSave={this.handleImportReport}/>
        }
      </Layout>
    );
  }
}

Page.propTypes = {
  entityCommand: PropTypes.entitycommand,
  onChanged: PropTypes.func.isRequired,
};

Page.contextTypes = {
  gmp: PropTypes.gmp.isRequired,
  capabilities: PropTypes.capabilities.isRequired,
};

export default withEntitiesContainer(Page, 'task', {
  dashboard: Dashboard,
  filterEditDialog: TaskFilterDialog,
  filtersFilter: TASKS_FILTER_FILTER,
  sectionIcon: 'task.svg',
  table: Table,
  title: _('Tasks'),
  toolBarIcons: ToolBarIcons,
});

// vim: set ts=2 sw=2 tw=80:

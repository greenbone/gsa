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

import _ from 'gmp/locale';

import {isDefined} from 'gmp/utils/identity';
import {selectSaveId} from 'gmp/utils/id';

import PropTypes from '../../utils/proptypes.js';

import EntitiesPage from '../../entities/page.js';
import withEntitiesContainer from '../../entities/withEntitiesContainer.js';

import DashboardControls from '../../components/dashboard/controls';

import ManualIcon from '../../components/icon/manualicon.js';
import Icon from '../../components/icon/icon.js';

import IconDivider from '../../components/layout/icondivider.js';
import Wrapper from '../../components/layout/wrapper.js';

import ContainerTaskDialog from '../../pages/tasks/containerdialog.js';

import ReportFilterDialog from './filterdialog.js';
import ImportReportDialog from './importdialog.js';
import ReportsTable from './table.js';

import ReportsDashboard, {REPORTS_DASHBOARD_ID} from './dashboard';

import Filter, {REPORTS_FILTER_FILTER} from 'gmp/models/filter.js';

const ToolBarIcons = ({onUploadReportClick}) => (
  <IconDivider>
    <ManualIcon
      page="vulnerabilitymanagement"
      anchor="reading-of-the-reports"
      title={_('Help: Reports')}
    />
    <Icon
      title={_('Upload report')}
      img="upload.svg"
      onClick={onUploadReportClick}
    />
  </IconDivider>
);

ToolBarIcons.propTypes = {
  onUploadReportClick: PropTypes.func,
};

class Page extends React.Component {

  constructor(...args) {
    super(...args);

    this.state = {
      importDialogVisible: false,
      containerTaskDialogVisible: false,
    };

    this.handleDialogSave = this.handleDialogSave.bind(this);
    this.handleCreateContainerTask = this.handleCreateContainerTask.bind(this);
    this.handleCloseContainerTask = this.handleCloseContainerTask.bind(this);
    this.handleReportDeltaSelect = this.handleReportDeltaSelect.bind(this);
    this.handleReportDeleteClick = this.handleReportDeleteClick.bind(this);
    this.handleTaskChange = this.handleTaskChange.bind(this);

    this.openImportDialog = this.openImportDialog.bind(this);
    this.closeImportDialog = this.closeImportDialog.bind(this);
    this.openCreateTaskDialog = this.openCreateTaskDialog.bind(this);
    this.loadTasks = this.loadTasks.bind(this);
  }

  componentWillReceiveProps(next) {
    const {filter} = next;
    const {selectedDeltaReport} = this.state;

    if (isDefined(selectedDeltaReport) &&
      (!isDefined(filter) ||
        filter.get('task_id') !== selectedDeltaReport.task.id)) {
      // filter has changed. reset delta report selection
      this.setState({selectedDeltaReport: undefined});
    }
  }

  loadTasks() {
    const {gmp} = this.context;
    return gmp.tasks.get()
      .then(response => {
        const {data: tasks} = response;
        return tasks.filter(task => task.isContainer());
      });
  }

  openImportDialog(task_id) {
    this.loadTasks().then(
      tasks => this.setState({
        tasks,
        task_id: selectSaveId(tasks),
        importDialogVisible: true,
      }));
  }

  openCreateTaskDialog() {
    this.setState({containerTaskDialogVisible: true});
  }

  closeImportDialog() {
    this.setState({importDialogVisible: false});
  }

  handleDialogSave(data) {
    const {gmp} = this.context;
    const {onChanged, onError} = this.props;
    return gmp.report.import(data).then(onChanged, onError);
  }

  handleCreateContainerTask(data) {
    const {gmp} = this.context;
    let task_id;
    return gmp.task.createContainer(data)
      .then(response => {
        const {data: task} = response;
        task_id = task.id;
      })
      .then(this.loadTasks)
      .then(tasks => this.setState({tasks, task_id}));
  }

  handleCloseContainerTask() {
    this.setState({containerTaskDialogVisible: false});
  }

  handleReportDeltaSelect(report) {
    const {selectedDeltaReport} = this.state;

    if (isDefined(selectedDeltaReport)) {
      const {router} = this.props;
      router.push('/report/delta/' + selectedDeltaReport.id + '/' +
        report.id);
    }
    else {
      const {onFilterChanged, filter = new Filter()} = this.props;
      onFilterChanged(filter.copy().set('task_id', report.task.id));
      this.setState({selectedDeltaReport: report});
    }
  }

  handleReportDeleteClick(report) {
    const {gmp} = this.context;
    const {onChanged, onError} = this.props;
    return gmp.report.delete(report).then(onChanged, onError);
  }

  handleTaskChange(task_id) {
    this.setState({task_id});
  }

  render() {
    const {
      containerTaskDialogVisible,
      importDialogVisible,
      task_id,
      tasks,
    } = this.state;

    return (
      <Wrapper>
        <EntitiesPage
          {...this.props}
          {...this.state}
          onUploadReportClick={this.openImportDialog}
          onReportDeltaSelect={this.handleReportDeltaSelect}
          onReportDeleteClick={this.handleReportDeleteClick}
        />
        {importDialogVisible &&
          <ImportReportDialog
            task_id={task_id}
            tasks={tasks}
            visible={importDialogVisible}
            onNewContainerTaskClick={this.openCreateTaskDialog}
            onClose={this.closeImportDialog}
            onSave={this.handleDialogSave}
            onTaskChange={this.handleTaskChange}
          />
        }
        {containerTaskDialogVisible &&
          <ContainerTaskDialog
            onClose={this.handleCloseContainerTask}
            onSave={this.handleCreateContainerTask}
          />
        }
      </Wrapper>
    );
  }
}

Page.propTypes = {
  filter: PropTypes.filter,
  router: PropTypes.object.isRequired,
  onChanged: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  onFilterChanged: PropTypes.func.isRequired,
};

Page.contextTypes = {
  gmp: PropTypes.gmp.isRequired,
};

export default withEntitiesContainer('report', {
  filtersFilter: REPORTS_FILTER_FILTER,
  dashboard2: ReportsDashboard,
  dashboardControls: () => (
    <DashboardControls dashboardId={REPORTS_DASHBOARD_ID} />
  ),
  title: _('Reports'),
  sectionIcon: 'report.svg',
  filterEditDialog: ReportFilterDialog,
  toolBarIcons: ToolBarIcons,
  table: ReportsTable,
})(Page);

// vim: set ts=2 sw=2 tw=80:

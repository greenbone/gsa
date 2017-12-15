/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2017 Greenbone Networks GmbH
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

import _ from 'gmp/locale.js';
import {is_defined, select_save_id} from 'gmp/utils.js';

import PropTypes from '../../utils/proptypes.js';

import EntitiesPage from '../../entities/page.js';
import withEntitiesContainer from '../../entities/withEntitiesContainer.js';

import {withDashboard} from '../../components/dashboard/dashboard.js';

import HelpIcon from '../../components/icon/helpicon.js';
import Icon from '../../components/icon/icon.js';

import IconDivider from '../../components/layout/icondivider.js';
import Wrapper from '../../components/layout/wrapper.js';

import ContainerTaskDialog from '../../pages/tasks/containerdialog.js';

import ReportCharts from './charts.js';
import ReportFilterDialog from './filterdialog.js';
import ImportReportDialog from './importdialog.js';
import ReportsTable from './table.js';

import Filter, {REPORTS_FILTER_FILTER} from 'gmp/models/filter.js';

const Dashboard = withDashboard(ReportCharts, {
  hideFilterSelect: true,
  configPrefId: 'Äe599bb6b-b95a-4bb2-a6bb-fe8ac69bc071',
  defaultControllersString: 'report-by-severity-class|' +
    'report-by-high-results|report-by-cvss',
  defaultControllerString: 'report-by-cvss',
});

const ToolBarIcons = ({onUploadReportClick}) => (
  <IconDivider>
    <HelpIcon page="reports"/>
    <Icon
      size="small"
      title={_('Upload report')}
      img="upload.svg"
      onClick={onUploadReportClick}/>
  </IconDivider>
);

ToolBarIcons.propTypes = {
  onUploadReportClick: PropTypes.func,
};

class Page extends React.Component {

  constructor(...args) {
    super(...args);

    this.state = {};

    this.handleDialogSave = this.handleDialogSave.bind(this);
    this.handleCreateContainerTask = this.handleCreateContainerTask.bind(this);
    this.handleReportDeltaSelect = this.handleReportDeltaSelect.bind(this);
    this.handleReportDeleteClick = this.handleReportDeleteClick.bind(this);
    this.openImportDialog = this.openImportDialog.bind(this);
    this.openCreateTaskDialog = this.openCreateTaskDialog.bind(this);
  }

  componentWillReceiveProps(next) {
    const {filter} = next;
    const {selectedDeltaReport} = this.state;

    if (is_defined(selectedDeltaReport) &&
      (!is_defined(filter) ||
        filter.get('task_id') !== selectedDeltaReport.task.id)) {
      // filter has changed. reset delta report selection
      this.setState({selectedDeltaReport: undefined});
    }
  }

  showImportDialog(tasks, task_id) {
    this.import_dialog.show({
      tasks,
      in_assets: 1,
      task_id: select_save_id(tasks, task_id),
    });
  }

  openImportDialog(task_id) {
    const {gmp} = this.context;
    gmp.tasks.get()
      .then(response => {
        const {data: tasks} = response;
        return tasks.filter(task => task.isContainer());
      })
      .then(tasks => this.showImportDialog(tasks, task_id));
  }

  openCreateTaskDialog() {
    this.container_task_dialog.show();
  }

  handleDialogSave(data) {
    const {gmp} = this.context;
    const {onChanged, onError} = this.props;
    return gmp.report.import(data).then(onChanged, onError);
  }

  handleCreateContainerTask(data) {
    const {gmp} = this.context;
    return gmp.task.createContainer(data).then(response => {
      const task = response.data;
      this.openImportDialog(task.id);
    });
  }

  handleReportDeltaSelect(report) {
    const {selectedDeltaReport} = this.state;

    if (is_defined(selectedDeltaReport)) {
      const {router} = this.props;
      router.push('/ng/report/delta/' + selectedDeltaReport.id + '/' +
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

  render() {
    return (
      <Wrapper>
        <EntitiesPage
          {...this.props}
          {...this.state}
          onUploadReportClick={this.openImportDialog}
          onReportDeltaSelect={this.handleReportDeltaSelect}
          onReportDeleteClick={this.handleReportDeleteClick}
        />
        <ImportReportDialog
          ref={ref => this.import_dialog = ref}
          onNewContainerTaskClick={this.openCreateTaskDialog}
          onSave={this.handleDialogSave}/>
        <ContainerTaskDialog
          ref={ref => this.container_task_dialog = ref}
          onSave={this.handleCreateContainerTask}/>
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
  dashboard: Dashboard,
  title: _('Reports'),
  sectionIcon: 'report.svg',
  filterEditDialog: ReportFilterDialog,
  toolBarIcons: ToolBarIcons,
  table: ReportsTable,
})(Page);

// vim: set ts=2 sw=2 tw=80:

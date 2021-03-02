/* Copyright (C) 2017-2021 Greenbone Networks GmbH
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

import Filter, {REPORTS_FILTER_FILTER} from 'gmp/models/filter';

import {isActive} from 'gmp/models/task';

import {isDefined} from 'gmp/utils/identity';

import EntitiesPage from 'web/entities/page';
import withEntitiesContainer from 'web/entities/withEntitiesContainer';

import DashboardControls from 'web/components/dashboard/controls';

import ManualIcon from 'web/components/icon/manualicon';
import UploadIcon from 'web/components/icon/uploadicon';
import ReportIcon from 'web/components/icon/reporticon';

import IconDivider from 'web/components/layout/icondivider';
import PageTitle from 'web/components/layout/pagetitle';

import {
  USE_DEFAULT_RELOAD_INTERVAL,
  USE_DEFAULT_RELOAD_INTERVAL_ACTIVE,
} from 'web/components/loading/reload';

import ContainerTaskDialog from 'web/pages/tasks/containerdialog';

import {
  loadEntities,
  selector as entitiesSelector,
} from 'web/store/entities/reports';

import {
  loadAllEntities as loadAllTasks,
  selector as tasksSelector,
} from 'web/store/entities/tasks';

import compose from 'web/utils/compose';
import PropTypes from 'web/utils/proptypes';
import withGmp from 'web/utils/withGmp';

import ReportFilterDialog from './filterdialog';
import ImportReportDialog from './importdialog';
import ReportsTable from './table';

import ReportsDashboard, {REPORTS_DASHBOARD_ID} from './dashboard';

const CONTAINER_TASK_FILTER = Filter.fromString('target=""');

export const ToolBarIcons = ({onUploadReportClick}) => (
  <IconDivider>
    <ManualIcon
      page="reports"
      anchor="using-and-managing-reports"
      title={_('Help: Reports')}
    />
    <UploadIcon title={_('Upload report')} onClick={onUploadReportClick} />
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

    this.handleImportReport = this.handleImportReport.bind(this);
    this.handleCreateContainerTask = this.handleCreateContainerTask.bind(this);
    this.handleCloseContainerTask = this.handleCloseContainerTask.bind(this);
    this.handleReportDeltaSelect = this.handleReportDeltaSelect.bind(this);
    this.handleReportDeleteClick = this.handleReportDeleteClick.bind(this);
    this.handleTaskChange = this.handleTaskChange.bind(this);

    this.openImportDialog = this.openImportDialog.bind(this);
    this.handleCloseImportDialog = this.handleCloseImportDialog.bind(this);
    this.openCreateTaskDialog = this.openCreateTaskDialog.bind(this);
  }

  static getDerivedStateFromProps(props, state) {
    const {filter} = props;
    const {selectedDeltaReport} = state;

    if (
      isDefined(selectedDeltaReport) &&
      (!isDefined(filter) ||
        filter.get('task_id') !== selectedDeltaReport.task.id)
    ) {
      // filter has changed. reset delta report selection
      return {selectedDeltaReport: undefined};
    }
    return null;
  }

  openCreateTaskDialog() {
    this.setState({containerTaskDialogVisible: true});
  }

  openImportDialog(task_id) {
    this.props.loadTasks().then(() => {
      this.setState({
        importDialogVisible: true,
      });
    });
  }

  closeImportDialog() {
    this.setState({importDialogVisible: false});
  }

  handleCloseImportDialog() {
    this.closeImportDialog();
  }

  handleImportReport(data) {
    const {gmp, onChanged, onError} = this.props;
    return gmp.report
      .import(data)
      .then(onChanged, onError)
      .then(() => this.closeImportDialog());
  }

  closeContainerTaskDialog() {
    this.setState({containerTaskDialogVisible: false});
  }

  handleCreateContainerTask(data) {
    const {gmp} = this.props;
    return gmp.task.createContainer(data).then(response => {
      const {data: task} = response;
      this.props.loadTasks();
      this.setState({task_id: task.id});
      this.closeContainerTaskDialog();
    });
  }

  handleCloseContainerTask() {
    this.closeContainerTaskDialog();
  }

  handleReportDeltaSelect(report) {
    const {onFilterChanged} = this.props;
    const {selectedDeltaReport, beforeSelectFilter} = this.state;

    if (isDefined(selectedDeltaReport)) {
      const {history} = this.props;

      onFilterChanged(beforeSelectFilter);

      history.push('/report/delta/' + selectedDeltaReport.id + '/' + report.id);
    } else {
      const {filter = new Filter()} = this.props;

      onFilterChanged(
        filter
          .copy()
          .set('first', 1) // reset to first page
          .set('task_id', report.task.id),
      );

      this.setState({
        beforeSelectFilter: filter,
        selectedDeltaReport: report,
      });
    }
  }

  handleReportDeleteClick(report) {
    const {onDelete} = this.props;
    return onDelete(report);
  }

  handleTaskChange(task_id) {
    this.setState({task_id});
  }

  render() {
    const {filter, onFilterChanged, onInteraction, tasks} = this.props;
    const {
      containerTaskDialogVisible,
      importDialogVisible,
      task_id,
    } = this.state;

    return (
      <React.Fragment>
        <PageTitle title={_('Reports')} />
        <EntitiesPage
          {...this.props}
          {...this.state}
          dashboard={() => (
            <ReportsDashboard
              filter={filter}
              onFilterChanged={onFilterChanged}
              onInteraction={onInteraction}
            />
          )}
          dashboardControls={() => (
            <DashboardControls
              dashboardId={REPORTS_DASHBOARD_ID}
              onInteraction={onInteraction}
            />
          )}
          filtersFilter={REPORTS_FILTER_FILTER}
          filterEditDialog={ReportFilterDialog}
          table={ReportsTable}
          toolBarIcons={ToolBarIcons}
          title={_('Reports')}
          sectionIcon={<ReportIcon size="large" />}
          onInteraction={onInteraction}
          onUploadReportClick={this.openImportDialog}
          onReportDeltaSelect={this.handleReportDeltaSelect}
          onReportDeleteClick={this.handleReportDeleteClick}
        />
        {importDialogVisible && (
          <ImportReportDialog
            task_id={task_id}
            tasks={tasks}
            onNewContainerTaskClick={this.openCreateTaskDialog}
            onClose={this.handleCloseImportDialog}
            onSave={this.handleImportReport}
            onTaskChange={this.handleTaskChange}
          />
        )}
        {containerTaskDialogVisible && (
          <ContainerTaskDialog
            onClose={this.handleCloseContainerTask}
            onSave={this.handleCreateContainerTask}
          />
        )}
      </React.Fragment>
    );
  }
}

Page.propTypes = {
  filter: PropTypes.filter,
  gmp: PropTypes.gmp.isRequired,
  history: PropTypes.object.isRequired,
  loadTasks: PropTypes.func.isRequired,
  tasks: PropTypes.arrayOf(PropTypes.model),
  onChanged: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  onFilterChanged: PropTypes.func.isRequired,
  onInteraction: PropTypes.func.isRequired,
};

const reportsReloadInterval = ({entities = []}) =>
  entities.some(entity => isActive(entity.report.scan_run_status))
    ? USE_DEFAULT_RELOAD_INTERVAL_ACTIVE
    : USE_DEFAULT_RELOAD_INTERVAL;

const mapStateToProps = rootState => {
  const sel = tasksSelector(rootState);
  return {
    tasks: sel.getAllEntities(CONTAINER_TASK_FILTER),
  };
};

const mapDispatchToProps = (dispatch, {gmp}) => ({
  loadTasks: () => dispatch(loadAllTasks(gmp)(CONTAINER_TASK_FILTER)),
});

const FALLBACK_REPORT_LIST_FILTER = Filter.fromString(
  'sort-reverse=date first=1',
);

export default compose(
  withGmp,
  connect(mapStateToProps, mapDispatchToProps),
  withEntitiesContainer('report', {
    fallbackFilter: FALLBACK_REPORT_LIST_FILTER,
    entitiesSelector,
    loadEntities,
    reloadInterval: reportsReloadInterval,
  }),
)(Page);

// vim: set ts=2 sw=2 tw=80:

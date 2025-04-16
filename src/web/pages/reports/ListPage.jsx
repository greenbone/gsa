/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Filter, {REPORTS_FILTER_FILTER} from 'gmp/models/filter';
import {isActive} from 'gmp/models/task';
import {isDefined} from 'gmp/utils/identity';
import React from 'react';
import {connect} from 'react-redux';
import DashboardControls from 'web/components/dashboard/Controls';
import {ReportIcon, UploadIcon} from 'web/components/icon';
import ManualIcon from 'web/components/icon/ManualIcon';
import IconDivider from 'web/components/layout/IconDivider';
import PageTitle from 'web/components/layout/PageTitle';
import {
  USE_DEFAULT_RELOAD_INTERVAL,
  USE_DEFAULT_RELOAD_INTERVAL_ACTIVE,
} from 'web/components/loading/Reload';
import EntitiesPage from 'web/entities/Page';
import withEntitiesContainer from 'web/entities/withEntitiesContainer';
import useTranslation from 'web/hooks/useTranslation';
import ReportsDashboard, {
  REPORTS_DASHBOARD_ID,
} from 'web/pages/reports/dashboard';
import ReportFilterDialog from 'web/pages/reports/FilterDialog';
import ImportReportDialog from 'web/pages/reports/ImportDialog';
import ReportsTable from 'web/pages/reports/Table';
import ContainerTaskDialog from 'web/pages/tasks/ContainerDialog';
import {
  loadEntities,
  selector as entitiesSelector,
} from 'web/store/entities/reports';
import {
  loadAllEntities as loadAllTasks,
  selector as tasksSelector,
} from 'web/store/entities/tasks';
import compose from 'web/utils/Compose';
import PropTypes from 'web/utils/PropTypes';
import withGmp from 'web/utils/withGmp';
import withTranslation from 'web/utils/withTranslation';
const CONTAINER_TASK_FILTER = Filter.fromString('target=""');

const ToolBarIcons = ({onUploadReportClick}) => {
  const [_] = useTranslation();
  return (
    <IconDivider>
      <ManualIcon
        anchor="using-and-managing-reports"
        page="reports"
        title={_('Help: Reports')}
      />
      <UploadIcon title={_('Upload report')} onClick={onUploadReportClick} />
    </IconDivider>
  );
};

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

  openImportDialog() {
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
      const {navigate} = this.props;

      onFilterChanged(beforeSelectFilter);

      navigate('/report/delta/' + selectedDeltaReport.id + '/' + report.id, {
        replace: true,
      });
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
    const {_} = this.props;

    const {filter, onFilterChanged, onInteraction, tasks} = this.props;
    const {containerTaskDialogVisible, importDialogVisible, task_id} =
      this.state;

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
          filterEditDialog={ReportFilterDialog}
          filtersFilter={REPORTS_FILTER_FILTER}
          sectionIcon={<ReportIcon size="large" />}
          table={ReportsTable}
          title={_('Reports')}
          toolBarIcons={ToolBarIcons}
          onInteraction={onInteraction}
          onReportDeleteClick={this.handleReportDeleteClick}
          onReportDeltaSelect={this.handleReportDeltaSelect}
          onUploadReportClick={this.openImportDialog}
        />
        {importDialogVisible && (
          <ImportReportDialog
            task_id={task_id}
            tasks={tasks}
            onClose={this.handleCloseImportDialog}
            onNewContainerTaskClick={this.openCreateTaskDialog}
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
  navigate: PropTypes.func.isRequired,
  loadTasks: PropTypes.func.isRequired,
  tasks: PropTypes.arrayOf(PropTypes.model),
  onChanged: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  onFilterChanged: PropTypes.func.isRequired,
  onInteraction: PropTypes.func.isRequired,
  _: PropTypes.func.isRequired,
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
)(withTranslation(Page));

/* Copyright (C) 2024 Greenbone AG
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

import _ from 'gmp/locale';

import Filter, {AUDIT_REPORTS_FILTER_FILTER} from 'gmp/models/filter';

import {isActive} from 'gmp/models/task';

import {isDefined} from 'gmp/utils/identity';

import EntitiesPage from 'web/entities/page';
import withEntitiesContainer from 'web/entities/withEntitiesContainer';

import DashboardControls from 'web/components/dashboard/controls';

import ManualIcon from 'web/components/icon/manualicon';
import ReportIcon from 'web/components/icon/reporticon';

import IconDivider from 'web/components/layout/icondivider';
import PageTitle from 'web/components/layout/pagetitle';

import {
  USE_DEFAULT_RELOAD_INTERVAL,
  USE_DEFAULT_RELOAD_INTERVAL_ACTIVE,
} from 'web/components/loading/reload';

import {
  loadEntities,
  selector as entitiesSelector,
} from 'web/store/entities/auditreports';

import compose from 'web/utils/compose';
import PropTypes from 'web/utils/proptypes';
import withGmp from 'web/utils/withGmp';

import AuditFilterDialog from './auditfilterdialog';
import AuditReportsTable from './auditreportstable';

import AuditReportsDashboard, {
  AUDIT_REPORTS_DASHBOARD_ID,
} from './auditdashboard';

const ToolBarIcons = () => (
  <IconDivider>
    <ManualIcon
      page="reports"
      anchor="using-and-managing-reports"
      title={_('Help: Reports')}
    />
  </IconDivider>
);

class Page extends React.Component {
  constructor(...args) {
    super(...args);

    this.state = {};

    this.handleReportDeltaSelect = this.handleReportDeltaSelect.bind(this);
    this.handleReportDeleteClick = this.handleReportDeleteClick.bind(this);
    this.handleTaskChange = this.handleTaskChange.bind(this);
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

  handleReportDeltaSelect(report) {
    const {onFilterChanged} = this.props;
    const {selectedDeltaReport, beforeSelectFilter} = this.state;

    if (isDefined(selectedDeltaReport)) {
      const {history} = this.props;

      onFilterChanged(beforeSelectFilter);

      history.push(
        '/auditreport/delta/' + selectedDeltaReport.id + '/' + report.id,
      );
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
    const {filter, onFilterChanged, onInteraction} = this.props;
    return (
      <React.Fragment>
        <PageTitle title={_('Audit Reports')} />
        <EntitiesPage
          {...this.props}
          {...this.state}
          dashboard={() => (
            <AuditReportsDashboard
              filter={filter}
              onFilterChanged={onFilterChanged}
              onInteraction={onInteraction}
            />
          )}
          dashboardControls={() => (
            <DashboardControls
              dashboardId={AUDIT_REPORTS_DASHBOARD_ID}
              onInteraction={onInteraction}
            />
          )}
          filtersFilter={AUDIT_REPORTS_FILTER_FILTER}
          filterEditDialog={AuditFilterDialog}
          table={AuditReportsTable}
          toolBarIcons={ToolBarIcons}
          title={_('Audit Reports')}
          sectionIcon={<ReportIcon size="large" />}
          onInteraction={onInteraction}
          onReportDeltaSelect={this.handleReportDeltaSelect}
          onReportDeleteClick={this.handleReportDeleteClick}
        />
      </React.Fragment>
    );
  }
}

Page.propTypes = {
  filter: PropTypes.filter,
  gmp: PropTypes.gmp.isRequired,
  history: PropTypes.object.isRequired,
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

const FALLBACK_REPORT_LIST_FILTER = Filter.fromString(
  'sort-reverse=date first=1',
);

export default compose(
  withGmp,
  withEntitiesContainer('auditreport', {
    fallbackFilter: FALLBACK_REPORT_LIST_FILTER,
    entitiesSelector,
    loadEntities,
    reloadInterval: reportsReloadInterval,
  }),
)(Page);

// vim: set ts=2 sw=2 tw=80:

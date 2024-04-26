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

import React, {useEffect, useState} from 'react';

import {useHistory} from 'react-router-dom';

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

import AuditFilterDialog from './auditfilterdialog';
import AuditReportsTable from './auditreportstable';

import AuditReportsDashboard, {
  AUDIT_REPORTS_DASHBOARD_ID,
} from './auditdashboard';

const ToolBarIcons = () => (
  <IconDivider>
    <ManualIcon
      page="reports"
      anchor="using-and-managing-audit-reports"
      title={_('Help: Audit Reports')}
    />
  </IconDivider>
);

const AuditReportsPage = ({
  filter,
  onFilterChanged,
  onInteraction,
  onDelete,
  ...props
}) => {
  const [selectedDeltaReport, setSelectedDeltaReport] = useState();
  const [beforeSelectFilter, setBeforeSelectFilter] = useState();
  const history = useHistory();

  useEffect(() => {
    if (
      isDefined(selectedDeltaReport) &&
      (!isDefined(filter) ||
        filter.get('task_id') !== selectedDeltaReport.task.id)
    ) {
      // filter has changed. reset delta report selection
      setSelectedDeltaReport();
    }
  }, [filter, selectedDeltaReport]);

  const handleReportDeleteClick = onDelete;

  const handleReportDeltaSelect = report => {
    if (isDefined(selectedDeltaReport)) {
      onFilterChanged(beforeSelectFilter);

      history.push(
        '/auditreport/delta/' + selectedDeltaReport.id + '/' + report.id,
      );
    } else {
      if (!isDefined(filter)) {
        filter = new Filter();
      }

      onFilterChanged(
        filter
          .copy()
          .set('first', 1) // reset to first page
          .set('task_id', report.task.id),
      );
      setSelectedDeltaReport(report);
      setBeforeSelectFilter(filter);
    }
  };

  return (
    <React.Fragment>
      <PageTitle title={_('Audit Reports')} />
      <EntitiesPage
        {...props}
        selectedDeltaReport={selectedDeltaReport}
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
        filter={filter}
        onFilterChanged={onFilterChanged}
        onInteraction={onInteraction}
        onReportDeltaSelect={handleReportDeltaSelect}
        onReportDeleteClick={handleReportDeleteClick}
      />
    </React.Fragment>
  );
};

AuditReportsPage.propTypes = {
  filter: PropTypes.filter,
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

const FALLBACK_AUDIT_REPORT_LIST_FILTER = Filter.fromString(
  'report_compliance_levels=yniu sort-reverse=date first=1',
);

export default compose(
  withEntitiesContainer('auditreport', {
    fallbackFilter: FALLBACK_AUDIT_REPORT_LIST_FILTER,
    entitiesSelector,
    loadEntities,
    reloadInterval: reportsReloadInterval,
  }),
)(AuditReportsPage);

// vim: set ts=2 sw=2 tw=80:

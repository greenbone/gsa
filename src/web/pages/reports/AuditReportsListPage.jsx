/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Filter, {AUDIT_REPORTS_FILTER_FILTER} from 'gmp/models/filter';
import {isActive} from 'gmp/models/task';
import {isDefined} from 'gmp/utils/identity';
import React, {useEffect, useState} from 'react';
import {useNavigate} from 'react-router';
import DashboardControls from 'web/components/dashboard/Controls';
import ManualIcon from 'web/components/icon/ManualIcon';
import ReportIcon from 'web/components/icon/ReportIcon';
import IconDivider from 'web/components/layout/IconDivider';
import PageTitle from 'web/components/layout/PageTitle';
import {
  USE_DEFAULT_RELOAD_INTERVAL,
  USE_DEFAULT_RELOAD_INTERVAL_ACTIVE,
} from 'web/components/loading/Reload';
import EntitiesPage from 'web/entities/Page';
import withEntitiesContainer from 'web/entities/withEntitiesContainer';
import useTranslation from 'web/hooks/useTranslation';
import AuditReportsDashboard, {
  AUDIT_REPORTS_DASHBOARD_ID,
} from 'web/pages/reports/auditdashboard';
import AuditFilterDialog from 'web/pages/reports/AuditFilterDialog';
import AuditReportsTable from 'web/pages/reports/AuditReportsTable';
import {
  loadEntities,
  selector as entitiesSelector,
} from 'web/store/entities/auditreports';
import PropTypes from 'web/utils/PropTypes';

const ToolBarIcons = () => {
  const [_] = useTranslation();
  return (
    <IconDivider>
      <ManualIcon
        anchor="using-and-managing-audit-reports"
        page="compliance-and-special-scans"
        title={_('Help: Audit Reports')}
      />
    </IconDivider>
  );
};

const AuditReportsPage = ({
  filter,
  onFilterChanged,
  onInteraction,
  onDelete,
  ...props
}) => {
  const [selectedDeltaReport, setSelectedDeltaReport] = useState();
  const [beforeSelectFilter, setBeforeSelectFilter] = useState();
  const navigate = useNavigate();
  const [_] = useTranslation();

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

      navigate(
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
        filter={filter}
        filterEditDialog={AuditFilterDialog}
        filtersFilter={AUDIT_REPORTS_FILTER_FILTER}
        sectionIcon={<ReportIcon size="large" />}
        selectedDeltaReport={selectedDeltaReport}
        table={AuditReportsTable}
        title={_('Audit Reports')}
        toolBarIcons={ToolBarIcons}
        onFilterChanged={onFilterChanged}
        onInteraction={onInteraction}
        onReportDeleteClick={handleReportDeleteClick}
        onReportDeltaSelect={handleReportDeltaSelect}
      />
    </React.Fragment>
  );
};

AuditReportsPage.propTypes = {
  filter: PropTypes.filter,
  navigate: PropTypes.func.isRequired,
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

export default withEntitiesContainer('auditreport', {
  fallbackFilter: FALLBACK_AUDIT_REPORT_LIST_FILTER,
  entitiesSelector,
  loadEntities,
  reloadInterval: reportsReloadInterval,
})(AuditReportsPage);

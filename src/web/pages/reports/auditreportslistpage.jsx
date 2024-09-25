/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React, {useEffect, useState} from 'react';

import {useNavigate} from 'react-router-dom';

import useTranslation from 'web/hooks/useTranslation';

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

import PropTypes from 'web/utils/proptypes';

import AuditFilterDialog from './auditfilterdialog';
import AuditReportsTable from './auditreportstable';

import AuditReportsDashboard, {
  AUDIT_REPORTS_DASHBOARD_ID,
} from './auditdashboard';

const ToolBarIcons = () => {
  const [_] = useTranslation();
  return (
    <IconDivider>
      <ManualIcon
        page="reports"
        anchor="using-and-managing-audit-reports"
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

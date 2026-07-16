/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {type FilterType} from 'gmp/models/filter';
import type AuditReportReport from 'gmp/models/report/audit-report';
import type ReportReport from 'gmp/models/report/report';
import type ReportTask from 'gmp/models/report/task';
import {isDefined} from 'gmp/utils/identity';
import {
  AddToAssetsIcon,
  DownloadIcon,
  PerformanceIcon,
  RemoveFromAssetsIcon,
  ResultIcon,
  TaskIcon,
  VulnerabilityIcon,
  TlsCertificateIcon,
} from 'web/components/icon';
import ListIcon from 'web/components/icon/ListIcon';
import ManualIcon from 'web/components/icon/ManualIcon';
import Divider from 'web/components/layout/Divider';
import IconDivider from 'web/components/layout/IconDivider';
import DetailsLink from 'web/components/link/DetailsLink';
import Link from 'web/components/link/Link';
import useTranslation from 'web/hooks/useTranslation';
import AlertActions from 'web/pages/reports/details/AlertActions';

interface ReportDetailsToolBarIconsProps {
  audit?: boolean;
  delta?: boolean;
  filter?: FilterType;
  isLoading?: boolean;
  report?: ReportReport | AuditReportReport;
  reportId: string;
  showError: (error: Error) => void;
  showErrorMessage: (message: string) => void;
  showSuccessMessage: (message: string) => void;
  showThresholdMessage?: boolean;
  task?: ReportTask;
  threshold?: number;
  onAddToAssetsClick?: () => void;
  onRemoveFromAssetsClick?: () => void;
  onReportDownloadClick?: () => void;
}

const ReportDetailsToolBarIcons = ({
  audit = false,
  delta = false,
  filter,
  isLoading = true,
  report,
  reportId,
  showThresholdMessage,
  task,
  threshold,
  onAddToAssetsClick,
  onRemoveFromAssetsClick,
  onReportDownloadClick,
  showError,
  showErrorMessage,
  showSuccessMessage,
}: ReportDetailsToolBarIconsProps) => {
  const [_] = useTranslation();

  return (
    <Divider margin="15px">
      <IconDivider>
        {audit ? (
          <>
            <ManualIcon
              anchor="using-and-managing-audit-reports"
              page="compliance-and-special-scans"
              title={_('Help: Audit Reports')}
            />
            <ListIcon page="auditreports" title={_('Audit Reports List')} />
          </>
        ) : (
          <>
            <ManualIcon
              anchor="reading-a-report"
              page="reports"
              title={_('Help: Reading Reports')}
            />
            <ListIcon page="reports" title={_('Reports List')} />
          </>
        )}
      </IconDivider>
      {!isLoading && (
        <>
          <IconDivider>
            {audit ? (
              <AddToAssetsIcon
                title={_('Add to Assets with QoD >= 70%')}
                onClick={onAddToAssetsClick}
              />
            ) : (
              <AddToAssetsIcon
                title={_('Add to Assets with QoD >= 70% and Overrides enabled')}
                onClick={onAddToAssetsClick}
              />
            )}
            <RemoveFromAssetsIcon
              title={_('Remove from Assets')}
              onClick={onRemoveFromAssetsClick}
            />
          </IconDivider>
          <IconDivider>
            <DetailsLink
              id={isDefined(task) ? (task.id as string) : ''}
              textOnly={!isDefined(task)}
              title={_('Corresponding Task')}
              type="task"
            >
              <TaskIcon />
            </DetailsLink>
            <Link
              filter={'report_id=' + reportId}
              title={_('Corresponding Results')}
              to="results"
            >
              <ResultIcon />
            </Link>
            {!audit && (
              <Link
                filter={'report_id=' + reportId}
                title={_('Corresponding Vulnerabilities')}
                to="vulnerabilities"
              >
                <VulnerabilityIcon />
              </Link>
            )}
            {!delta && (
              <Link
                filter={'report_id=' + reportId}
                title={_('Corresponding TLS Certificates')}
                to="tlscertificates"
              >
                <TlsCertificateIcon />
              </Link>
            )}
            {isDefined(task) && !task.isImport() && (
              <Link
                query={{
                  start: (isDefined(report?.scan_start)
                    ? report.scan_start
                        .utc()
                        .format('YYYY-MM-DDTHH:mm:ss.SSS[Z]')
                    : undefined) as string,
                  end: (isDefined(report?.scan_end)
                    ? report.scan_end.utc().format('YYYY-MM-DDTHH:mm:ss.SSS[Z]')
                    : undefined) as string,
                  // @ts-expect-error
                  ...(isDefined(report?.slave) && {scanner: report.slave.id}),
                }}
                title={_('Corresponding Performance')}
                to="performance"
              >
                <PerformanceIcon />
              </Link>
            )}
          </IconDivider>
          <IconDivider>
            <DownloadIcon
              title={_('Download filtered Report')}
              onClick={onReportDownloadClick}
            />
            {!delta && (
              <AlertActions
                audit={audit}
                filter={filter}
                reportId={reportId}
                showError={showError}
                showErrorMessage={showErrorMessage}
                showSuccessMessage={showSuccessMessage}
                showThresholdMessage={showThresholdMessage}
                threshold={threshold}
              />
            )}
          </IconDivider>
        </>
      )}
    </Divider>
  );
};

export default ReportDetailsToolBarIcons;

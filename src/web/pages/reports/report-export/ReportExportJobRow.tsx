/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {
  AlertCircleIcon,
  CheckIcon,
  CircleXDeleteIcon,
  DownloadIcon,
  RefreshIcon,
  ScheduleIcon,
  XIcon,
} from 'web/components/icon';
import Column from 'web/components/layout/Column';
import Row from 'web/components/layout/Row';
import Link from 'web/components/link/Link';
import useTranslation from 'web/hooks/useTranslation';
import {
  BADGE_COLORS,
  BADGE_ICON_SIZE,
  ActivityActions,
  ActivityErrorText,
  ActivityHeading,
  ActivityJob,
  ActivityStatusDetail,
  ActivityTitle,
  Spinning,
  StatusBadge,
  StatusIcon,
} from 'web/pages/reports/report-export/report-export-activity-styles';
import {useReportExportManager} from 'web/pages/reports/report-export/ReportExportManager';
import {
  type ReportExportStatusTone,
  getReportExportCancelTitle,
  getReportExportJobDisplay,
  getReportExportJobTitle,
} from 'web/report-export/report-export-job-display';
import {
  getReportExportActions,
  type ReportExportJob,
} from 'web/report-export/report-export-job-model';
import Theme from 'web/utils/theme';

const getActivityStatusIcon = (tone: ReportExportStatusTone) => {
  switch (tone) {
    case 'active':
      return (
        <Spinning>
          <RefreshIcon color="currentColor" size={BADGE_ICON_SIZE} />
        </Spinning>
      );
    case 'queued':
      return <ScheduleIcon color="currentColor" size={BADGE_ICON_SIZE} />;
    case 'downloading':
      return <DownloadIcon color="currentColor" size={BADGE_ICON_SIZE} />;
    case 'canceled':
      return <CircleXDeleteIcon color="currentColor" size={BADGE_ICON_SIZE} />;
    case 'error':
      return <AlertCircleIcon color="currentColor" size={BADGE_ICON_SIZE} />;
    case 'ready':
      return <CheckIcon color="currentColor" size={BADGE_ICON_SIZE} />;
  }
};

interface ReportExportJobRowProps {
  job: ReportExportJob;
}

const ReportExportJobRow = ({job}: ReportExportJobRowProps) => {
  const [_] = useTranslation();
  const {supportsCancellation, cancel, dismiss, download, retry} =
    useReportExportManager();
  const actions = getReportExportActions(job);
  const canCancel = supportsCancellation && actions.cancel;
  const status = getReportExportJobDisplay(job, _);
  const cancelTitle = getReportExportCancelTitle(job, _);
  const actionButtons = [
    {
      visible: canCancel,
      element: (
        <CircleXDeleteIcon
          key="cancel"
          aria-label={cancelTitle}
          color={Theme.darkRed}
          title={cancelTitle}
          onClick={() => cancel(job.key)}
        />
      ),
    },
    {
      visible: actions.download,
      element: (
        <DownloadIcon
          key="download"
          aria-label={_('Download report')}
          color={Theme.darkGreen}
          title={_('Download report')}
          onClick={() => download(job.key)}
        />
      ),
    },
    {
      visible: actions.retry,
      element: (
        <RefreshIcon
          key="retry"
          aria-label={_('Retry')}
          color={Theme.blue}
          title={_('Retry')}
          onClick={() => retry(job.key)}
        />
      ),
    },
    {
      visible: actions.dismiss,
      element: (
        <XIcon
          key="dismiss"
          aria-label={_('Remove from activity')}
          color={Theme.darkGray}
          title={_('Remove from activity')}
          onClick={() => dismiss(job.key)}
        />
      ),
    },
  ]
    .filter(({visible}) => visible)
    .map(({element}) => element);

  return (
    <ActivityJob data-testid="report-export-job">
      <Column gap="xs">
        <ActivityHeading>
          <ActivityTitle>{getReportExportJobTitle(job, _)}</ActivityTitle>
          <StatusBadge
            $tone={status.tone}
            color={BADGE_COLORS[status.tone]}
            size="md"
          >
            <StatusIcon aria-hidden="true">
              {getActivityStatusIcon(status.tone)}
            </StatusIcon>
            <output
              aria-live={actions.active ? 'polite' : undefined}
              data-state={status.tone}
              data-testid="report-export-status"
            >
              {status.label}
            </output>
          </StatusBadge>
        </ActivityHeading>
        {status.detail && (
          <ActivityStatusDetail>{status.detail}</ActivityStatusDetail>
        )}
        {job.statusError && (
          <ActivityErrorText role="status">
            {_('Status check failed; retrying: {{error}}', {
              error: job.statusError.message,
            })}
          </ActivityErrorText>
        )}
        {job.cancelError && (
          <ActivityErrorText role="alert">
            {_('Cancellation failed: {{error}}', {
              error: job.cancelError.message,
            })}
          </ActivityErrorText>
        )}
        {(job.reportUrl || actionButtons.length > 0) && (
          <ActivityActions>
            {job.reportUrl && (
              <Link to={job.reportUrl}>{_('View report details')}</Link>
            )}
            <Row gap={4} style={{gridColumn: 2}} wrap="nowrap">
              {actionButtons}
            </Row>
          </ActivityActions>
        )}
      </Column>
    </ActivityJob>
  );
};

export default ReportExportJobRow;

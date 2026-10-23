/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import DateTime from 'web/components/date/DateTime';
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
  ActivityDivider,
  ActivityErrorText,
  ActivityJob,
  ActivityMetadataSeparator,
  ActivityStatusDetail,
  ActivityTimestamp,
  ActivityTitle,
  Spinning,
  StatusBadge,
  StatusIcon,
} from 'web/report-export/report-export-activity-styles';
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
import {useReportExportActions} from 'web/report-export/ReportExportManager';
import Theme from 'web/utils/theme';
import {formattedUserSettingLongDate} from 'web/utils/user-setting-time-date-formatters';

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
    case 'complete':
      return <CheckIcon color="currentColor" size={BADGE_ICON_SIZE} />;
  }
};

interface ReportExportJobRowProps {
  job: ReportExportJob;
}

const ReportExportJobRow = ({job}: ReportExportJobRowProps) => {
  const [_] = useTranslation();
  const {supportsCancellation, cancel, dismiss, retry} =
    useReportExportActions();
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
      <Column data-testid="report-export-content" gap={8}>
        <Row data-testid="report-export-metadata" gap={8} wrap="wrap">
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
          {job.exportData?.creationTime && (
            <ActivityTimestamp data-testid="report-export-created-at">
              <ActivityMetadataSeparator aria-hidden="true">
                •
              </ActivityMetadataSeparator>{' '}
              {_('Created:')}{' '}
              <DateTime
                date={job.exportData.creationTime}
                formatter={formattedUserSettingLongDate}
              />
            </ActivityTimestamp>
          )}
        </Row>
        <ActivityTitle data-testid="report-export-title">
          {getReportExportJobTitle(job, _)}
        </ActivityTitle>
        {status.detail && (
          <ActivityStatusDetail>{status.detail}</ActivityStatusDetail>
        )}
        {job.cancelError && (
          <ActivityErrorText role="alert">
            {_('Cancellation failed: {{error}}', {
              error: job.cancelError.message,
            })}
          </ActivityErrorText>
        )}
      </Column>
      {(job.reportUrl || actionButtons.length > 0) && (
        <>
          <ActivityDivider data-testid="report-export-divider" />
          <Row data-testid="report-export-footer" justify="space-between">
            {job.reportUrl && (
              <Link to={job.reportUrl}>{_('View report details')}</Link>
            )}
            {actionButtons.length > 0 && (
              <Row
                data-testid="report-export-actions"
                gap={4}
                style={{marginLeft: 'auto'}}
                wrap="nowrap"
              >
                {actionButtons}
              </Row>
            )}
          </Row>
        </>
      )}
    </ActivityJob>
  );
};

export default ReportExportJobRow;

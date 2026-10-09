/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useEffect, useRef, useState} from 'react';
import {ActionIcon, Group, Loader, Popover, Stack, Text} from '@mantine/core';
import styled from 'styled-components';
import {
  AlertCircleIcon,
  CheckIcon,
  CircleXDeleteIcon,
  DownloadIcon,
  RefreshIcon,
  ScheduleIcon,
  XIcon,
} from 'web/components/icon';
import Link from 'web/components/link/Link';
import {type ReportExportJob} from 'web/hooks/useReportExport';
import useTranslation, {type TranslateFunc} from 'web/hooks/useTranslation';
import {getReportExportActions} from 'web/pages/reports/report-export-job';
import {useReportExportManager} from 'web/pages/reports/ReportExportManager';
import Theme from 'web/utils/theme';

const ActivityTrigger = styled(ActionIcon)`
  position: relative;

  @media (max-width: 600px) {
    background: var(--mantine-color-black);
    position: fixed;
    right: 8px;
    top: 9px;
  }
`;

const ActivityDot = styled.span<{
  $state: 'active' | 'error' | 'complete';
}>`
  background: ${props => {
    if (props.$state === 'error') return Theme.darkRed;
    if (props.$state === 'active') return Theme.green;
    return Theme.mediumGray;
  }};
  border: 2px solid ${Theme.darkGray};
  border-radius: 50%;
  height: 9px;
  position: absolute;
  right: 4px;
  top: 5px;
  width: 9px;
`;

const ActivityDropdown = styled.div`
  min-width: 0;
  width: 100%;
`;

type ActivityStatusTone =
  | 'active'
  | 'queued'
  | 'downloading'
  | 'canceled'
  | 'error'
  | 'ready';

type ActivityStatusIcon =
  | 'loading'
  | 'queued'
  | 'downloading'
  | 'canceled'
  | 'error'
  | 'ready';

const ActivityStatusPill = styled.div<{$tone: ActivityStatusTone}>`
  align-items: center;
  background: ${Theme.white};
  border-radius: 4px;
  color: ${props => {
    if (props.$tone === 'active') return Theme.darkGreen;
    if (props.$tone === 'queued' || props.$tone === 'downloading') {
      return Theme.blue;
    }
    if (props.$tone === 'error') return Theme.darkRed;
    if (props.$tone === 'ready') return Theme.darkGreen;
    return Theme.darkGray;
  }};
  display: inline-flex;
  flex: 0 0 auto;
  font-size: 12px;
  font-weight: 600;
  gap: 6px;
  line-height: 1.3;
  max-width: 100%;
  padding: 4px 8px;
`;

const ActivityStatusIconContainer = styled.span`
  align-items: center;
  display: inline-flex;
  height: 14px;
  justify-content: center;
  width: 14px;
`;

const ActivityStatusDetail = styled(Text)`
  overflow-wrap: anywhere;
`;

const ActivityHeading = styled.div`
  align-items: flex-start;
  display: flex;
  gap: 8px;
  justify-content: space-between;

  @media (max-width: 360px) {
    align-items: stretch;
    flex-direction: column;
  }
`;

const ActivityTitle = styled(Text)`
  min-width: 0;
  overflow-wrap: anywhere;
`;

const ActivityJob = styled.div`
  background: ${Theme.white};
  border: 1px solid ${Theme.lightGray};
  border-radius: 6px;
  min-width: 0;
  padding: 8px;
`;

const ActivityActions = styled.div`
  align-items: center;
  border-top: 1px solid ${Theme.lightGray};
  display: grid;
  gap: 6px;
  grid-template-columns: minmax(0, 1fr) auto;
  padding-top: 6px;

  a {
    font-size: 12px;
    min-width: 0;
    overflow-wrap: anywhere;
  }
`;

const ErrorText = styled(Text)`
  color: ${Theme.darkRed};
`;

interface ActivityStatusPresentation {
  label: string;
  detail?: string;
  tone: ActivityStatusTone;
  icon: ActivityStatusIcon;
}

const getRunningStatusPresentation = (
  progress: string | undefined,
  _: TranslateFunc,
): ActivityStatusPresentation => ({
  label: progress === 'preparing' ? _('Preparing') : _('Generating'),
  detail:
    progress && progress !== 'preparing' && progress !== 'generating'
      ? _('Progress: {{progress}}', {progress})
      : undefined,
  tone: 'active',
  icon: 'loading',
});

const getReportStatePresentation = (
  job: ReportExportJob,
  _: TranslateFunc,
): ActivityStatusPresentation => {
  switch (job.state.status) {
    case 'creating':
      return {
        label: _('Preparing'),
        tone: 'active',
        icon: 'loading',
      };
    case 'checking':
      return {
        label: _('Checking'),
        tone: 'active',
        icon: 'loading',
      };
    case 'unavailable':
      return {
        label: _('Unavailable'),
        detail: job.state.error.message,
        tone: 'error',
        icon: 'error',
      };
    case 'pending':
      return {
        label: _('Queued'),
        tone: 'queued',
        icon: 'queued',
      };
    case 'running':
      return getRunningStatusPresentation(job.state.exportData?.progress, _);
    case 'cancel_requested':
      return {
        label: _('Cancel requested'),
        tone: 'queued',
        icon: 'queued',
      };
    case 'canceled':
      return {
        label: _('Canceled'),
        tone: 'canceled',
        icon: 'canceled',
      };
    case 'error':
      return {
        label:
          job.state.exportData?.status === 'expired'
            ? _('Export expired')
            : _('Export failed'),
        detail: job.state.error.message,
        tone: 'error',
        icon: 'error',
      };
    case 'done':
      return {
        label: job.downloadStarted ? _('Complete') : _('Ready'),
        tone: 'ready',
        icon: 'ready',
      };
    case 'downloaded':
      return {
        label: _('Complete'),
        tone: 'ready',
        icon: 'ready',
      };
  }
  return {
    label: _('Preparing'),
    tone: 'active',
    icon: 'loading',
  };
};

const getActivityStatusPresentation = (
  job: ReportExportJob,
  _: TranslateFunc,
): ActivityStatusPresentation => {
  if (
    job.state.status === 'error' ||
    job.state.status === 'unavailable' ||
    job.state.status === 'canceled'
  ) {
    return getReportStatePresentation(job, _);
  }
  if (job.downloadError) {
    return {
      label: _('Download failed'),
      detail: job.downloadError.message,
      tone: 'error',
      icon: 'error',
    };
  }
  if (job.directPending || job.downloadPending) {
    return {
      label: _('Downloading'),
      tone: 'downloading',
      icon: 'downloading',
    };
  }
  if (job.cancelPending) {
    return {
      label: _('Canceling'),
      tone: 'queued',
      icon: 'queued',
    };
  }
  if (job.state.status === 'running') {
    return getRunningStatusPresentation(job.state.exportData?.progress, _);
  }
  return getReportStatePresentation(job, _);
};

const getActivityTitle = (job: ReportExportJob, _: TranslateFunc) => {
  let title = job.directDownload ? _('Report download') : _('Report export');
  if (job.reportTitle) {
    title = job.directDownload
      ? _('Report download: {{report}}', {report: job.reportTitle})
      : _('Report export: {{report}}', {report: job.reportTitle});
  }
  const extensionIndex = job.filename.lastIndexOf('.');
  const extension =
    extensionIndex > 0
      ? job.filename.slice(extensionIndex + 1).toLowerCase()
      : '';
  return extension ? `${title} (.${extension})` : title;
};

const getCancelButtonTitle = (job: ReportExportJob, _: TranslateFunc) => {
  if (job.cancelPending) return _('Cancellation requested');
  if (job.cancelError) return _('Retry cancellation');
  return _('Cancel report export');
};

const getActivityStatusIcon = (icon: ActivityStatusIcon) => {
  switch (icon) {
    case 'loading':
      return <Loader color={Theme.darkGreen} size={14} />;
    case 'queued':
      return <ScheduleIcon color={Theme.blue} />;
    case 'downloading':
      return <DownloadIcon color={Theme.blue} />;
    case 'canceled':
      return <CircleXDeleteIcon color={Theme.darkGray} />;
    case 'error':
      return <AlertCircleIcon color={Theme.darkRed} />;
    case 'ready':
      return <CheckIcon color={Theme.darkGreen} />;
  }
};

export const ReportExportActivity = () => {
  const {
    activityOpen,
    cancel,
    dismiss,
    download,
    retry,
    discoveryError,
    discoveryIncomplete,
    isActive,
    jobs,
    setActivityOpen,
    supportsCancellation,
  } = useReportExportManager();
  const [_] = useTranslation();
  const previousJobKeys = useRef(new Set(jobs.map(job => job.key)));
  const [recentKeys, setRecentKeys] = useState(
    () => new Set(jobs.filter(job => !job.downloadStarted).map(job => job.key)),
  );
  const visibleJobs = jobs
    .filter(job => !job.downloadStarted || recentKeys.has(job.key))
    .sort((first, second) => {
      if (first.autoDownload !== second.autoDownload)
        return first.autoDownload ? -1 : 1;
      return jobs.indexOf(second) - jobs.indexOf(first);
    });
  const changeActivityOpen = (open: boolean) => {
    if (!open)
      setRecentKeys(
        new Set(jobs.filter(job => !job.downloadStarted).map(job => job.key)),
      );
    setActivityOpen(open);
  };

  useEffect(() => {
    if (
      jobs.some(
        job =>
          !job.key.startsWith('recovered-') &&
          !previousJobKeys.current.has(job.key),
      )
    ) {
      setActivityOpen(true);
    }
    const additions = jobs
      .filter(
        job => !previousJobKeys.current.has(job.key) && !job.downloadStarted,
      )
      .map(job => job.key);
    if (additions.length)
      setRecentKeys(current => new Set([...current, ...additions]));
    previousJobKeys.current = new Set(jobs.map(job => job.key));
  }, [jobs, setActivityOpen]);

  if (visibleJobs.length === 0 && !discoveryError && !discoveryIncomplete)
    return null;

  const hasError = visibleJobs.some(
    job =>
      job.state.status === 'error' ||
      job.state.status === 'unavailable' ||
      job.cancelError ||
      job.downloadError,
  );
  let indicatorState: 'error' | 'active' | 'complete' = 'complete';
  if (isActive) indicatorState = 'active';
  if (hasError || discoveryError || discoveryIncomplete)
    indicatorState = 'error';

  return (
    <Popover
      offset={8}
      opened={activityOpen}
      position="bottom-end"
      styles={{
        dropdown: {
          boxSizing: 'border-box',
          maxWidth: 'calc(100vw - 24px)',
          maxHeight: 'min(70vh, 560px)',
          overflowY: 'auto',
          width: 'min(360px, calc(100vw - 24px))',
        },
      }}
      transitionProps={{duration: 0}}
      onChange={changeActivityOpen}
    >
      <Popover.Target>
        <ActivityTrigger
          aria-label={_('Report export activity')}
          data-testid="report-export-activity-button"
          title={_('Report export activity')}
          variant="transparent"
          onClick={() => changeActivityOpen(!activityOpen)}
        >
          <DownloadIcon color={Theme.white} />
          <ActivityDot $state={indicatorState} />
        </ActivityTrigger>
      </Popover.Target>
      <Popover.Dropdown data-testid="report-export-activity-popover">
        <ActivityDropdown>
          <Stack gap="sm">
            <Group justify="space-between" wrap="nowrap">
              <Text fw={600} size="sm">
                {_('Report exports ({{count}})', {count: visibleJobs.length})}
              </Text>
              <ActionIcon
                aria-label={_('Close export activity')}
                size="sm"
                variant="subtle"
                onClick={() => changeActivityOpen(false)}
              >
                <XIcon />
              </ActionIcon>
            </Group>
            {discoveryError && (
              <ErrorText role="alert" size="sm">
                {_('Export discovery failed: {{error}}', {
                  error: discoveryError.message,
                })}
              </ErrorText>
            )}
            {discoveryIncomplete && (
              <ErrorText role="status" size="sm">
                {_('Export list is incomplete')}
              </ErrorText>
            )}
            {visibleJobs.map(job => {
              const actions = getReportExportActions(job);
              const canCancel = supportsCancellation && actions.cancel;
              const jobIsActive = actions.active;
              const status = getActivityStatusPresentation(job, _);
              const isStatusError = status.tone === 'error';

              return (
                <ActivityJob key={job.key} data-testid="report-export-job">
                  <Stack gap="xs">
                    <ActivityHeading>
                      <ActivityTitle fw={600} size="sm">
                        {getActivityTitle(job, _)}
                      </ActivityTitle>
                      <ActivityStatusPill
                        $tone={status.tone}
                        aria-live={jobIsActive ? 'polite' : undefined}
                        data-state={status.tone}
                        data-testid="report-export-status"
                        role={isStatusError ? 'alert' : 'status'}
                      >
                        <ActivityStatusIconContainer aria-hidden="true">
                          {getActivityStatusIcon(status.icon)}
                        </ActivityStatusIconContainer>
                        {status.label}
                      </ActivityStatusPill>
                    </ActivityHeading>
                    {status.detail && (
                      <ActivityStatusDetail c="dimmed" size="xs">
                        {status.detail}
                      </ActivityStatusDetail>
                    )}
                    {job.statusError && (
                      <ErrorText role="status" size="sm">
                        {_('Status check failed; retrying: {{error}}', {
                          error: job.statusError.message,
                        })}
                      </ErrorText>
                    )}
                    {job.cancelError && (
                      <ErrorText role="alert" size="sm">
                        {_('Cancellation failed: {{error}}', {
                          error: job.cancelError.message,
                        })}
                      </ErrorText>
                    )}
                    {(job.reportUrl ||
                      canCancel ||
                      actions.dismiss ||
                      actions.download ||
                      actions.retry) && (
                      <ActivityActions>
                        {job.reportUrl && (
                          <Link to={job.reportUrl}>
                            {_('View report details')}
                          </Link>
                        )}
                        <Group gap={4} style={{gridColumn: 2}} wrap="nowrap">
                          {canCancel && (
                            <ActionIcon
                              aria-label={getCancelButtonTitle(job, _)}
                              size="sm"
                              title={getCancelButtonTitle(job, _)}
                              variant="subtle"
                              onClick={() => void cancel(job.key)}
                            >
                              <CircleXDeleteIcon color={Theme.darkRed} />
                            </ActionIcon>
                          )}
                          {actions.download && (
                            <ActionIcon
                              aria-label={_('Download report')}
                              size="sm"
                              title={_('Download report')}
                              variant="subtle"
                              onClick={() => void download(job.key)}
                            >
                              <DownloadIcon color={Theme.darkGreen} />
                            </ActionIcon>
                          )}
                          {actions.retry && (
                            <ActionIcon
                              aria-label={_('Retry')}
                              size="sm"
                              title={_('Retry')}
                              variant="subtle"
                              onClick={() => void retry(job.key)}
                            >
                              <RefreshIcon color={Theme.blue} />
                            </ActionIcon>
                          )}
                          {actions.dismiss && (
                            <ActionIcon
                              aria-label={_('Remove from activity')}
                              size="sm"
                              title={_('Remove from activity')}
                              variant="subtle"
                              onClick={() => dismiss(job.key)}
                            >
                              <XIcon color={Theme.darkGray} />
                            </ActionIcon>
                          )}
                        </Group>
                      </ActivityActions>
                    )}
                  </Stack>
                </ActivityJob>
              );
            })}
          </Stack>
        </ActivityDropdown>
      </Popover.Dropdown>
    </Popover>
  );
};

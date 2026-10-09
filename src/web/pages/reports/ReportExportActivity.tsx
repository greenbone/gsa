/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useEffect, useRef, useState} from 'react';
import {Popover} from '@mantine/core';
import {Badge, EThemeColors} from '@greenbone/ui-lib';
import styled, {keyframes} from 'styled-components';
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
import {useReportExportManager} from 'web/pages/reports/ReportExportManager';
import {
  getReportExportActions,
  type ReportExportJob,
} from 'web/report-export/job';
import {
  type ActivityStatusIcon,
  type ActivityStatusTone,
  getCancelButtonTitle,
  getJobPresentation,
  getJobTitle,
} from 'web/report-export/presentation';
import Theme from 'web/utils/theme';

const ActivityTrigger = styled.button`
  align-items: center;
  background: transparent;
  border: none;
  cursor: pointer;
  display: inline-flex;
  padding: 4px;
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
  right: 0;
  top: 1px;
  width: 9px;
`;

const ActivityDropdown = styled.div`
  min-width: 0;
  width: 100%;
`;

const BADGE_COLORS: Record<ActivityStatusTone, EThemeColors> = {
  active: EThemeColors.Green,
  queued: EThemeColors.Blue,
  downloading: EThemeColors.Blue,
  canceled: EThemeColors.NeutralLight,
  error: EThemeColors.RedLight,
  ready: EThemeColors.Green,
};

const spin = keyframes`
  to {
    transform: rotate(360deg);
  }
`;

const Spinning = styled.span`
  animation: ${spin} 1.2s linear infinite;
  display: inline-flex;
`;

const StatusBadge = styled(Badge)`
  flex: 0 0 auto;
  font-size: 12px;
  font-weight: 600;
  line-height: 1;
  white-space: nowrap;
`;

const StatusIcon = styled.span`
  align-items: center;
  display: inline-flex;
  height: 14px;
  width: 14px;
`;

const BADGE_ICON_SIZE: [string, string] = ['14px', '14px'];

const ActivityTitle = styled.span`
  color: ${Theme.black};
  font-size: 14px;
  font-weight: 600;
  min-width: 0;
  overflow-wrap: anywhere;
`;

const ActivityStatusDetail = styled.span`
  color: ${Theme.darkGray};
  font-size: 12px;
  overflow-wrap: anywhere;
`;

const ErrorText = styled.div`
  color: ${Theme.darkRed};
  font-size: 14px;
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

const isComplete = (job: ReportExportJob) => job.view.kind === 'complete';

const getActivityStatusIcon = (icon: ActivityStatusIcon) => {
  switch (icon) {
    case 'loading':
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
    () => new Set(jobs.filter(job => !isComplete(job)).map(job => job.key)),
  );
  const visibleJobs = jobs
    .filter(job => !isComplete(job) || recentKeys.has(job.key))
    .sort((first, second) => {
      if (first.autoDownload !== second.autoDownload)
        return first.autoDownload ? -1 : 1;
      return jobs.indexOf(second) - jobs.indexOf(first);
    });
  const changeActivityOpen = (open: boolean) => {
    if (!open)
      setRecentKeys(
        new Set(jobs.filter(job => !isComplete(job)).map(job => job.key)),
      );
    setActivityOpen(open);
  };

  useEffect(() => {
    if (
      jobs.some(
        job => job.origin === 'local' && !previousJobKeys.current.has(job.key),
      )
    ) {
      setActivityOpen(true);
    }
    const additions = jobs
      .filter(job => !previousJobKeys.current.has(job.key) && !isComplete(job))
      .map(job => job.key);
    if (additions.length)
      setRecentKeys(current => new Set([...current, ...additions]));
    previousJobKeys.current = new Set(jobs.map(job => job.key));
  }, [jobs, setActivityOpen]);

  if (visibleJobs.length === 0 && !discoveryError && !discoveryIncomplete)
    return null;

  const hasError = visibleJobs.some(
    job => job.view.kind === 'failed' || job.cancelError,
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
          type="button"
          onClick={() => changeActivityOpen(!activityOpen)}
        >
          <DownloadIcon color={Theme.white} />
          <ActivityDot $state={indicatorState} />
        </ActivityTrigger>
      </Popover.Target>
      <Popover.Dropdown data-testid="report-export-activity-popover">
        <ActivityDropdown>
          <Column gap="sm">
            <Row justify="space-between" wrap="nowrap">
              <ActivityTitle>
                {_('Report exports ({{count}})', {count: visibleJobs.length})}
              </ActivityTitle>
              <XIcon
                aria-label={_('Close export activity')}
                title={_('Close export activity')}
                onClick={() => changeActivityOpen(false)}
              />
            </Row>
            {discoveryError && (
              <ErrorText role="alert">
                {_('Export discovery failed: {{error}}', {
                  error: discoveryError.message,
                })}
              </ErrorText>
            )}
            {discoveryIncomplete && (
              <ErrorText role="status">
                {_('Export list is incomplete')}
              </ErrorText>
            )}
            {visibleJobs.map(job => {
              const actions = getReportExportActions(job);
              const canCancel = supportsCancellation && actions.cancel;
              const status = getJobPresentation(job, _);
              const cancelTitle = getCancelButtonTitle(job, _);

              return (
                <ActivityJob key={job.key} data-testid="report-export-job">
                  <Column gap="xs">
                    <ActivityHeading>
                      <ActivityTitle>{getJobTitle(job, _)}</ActivityTitle>
                      <StatusBadge color={BADGE_COLORS[status.tone]} size="md">
                        <StatusIcon aria-hidden="true">
                          {getActivityStatusIcon(status.icon)}
                        </StatusIcon>
                        <span
                          aria-live={actions.active ? 'polite' : undefined}
                          data-state={status.tone}
                          data-testid="report-export-status"
                          role={status.tone === 'error' ? 'alert' : 'status'}
                        >
                          {status.label}
                        </span>
                      </StatusBadge>
                    </ActivityHeading>
                    {status.detail && (
                      <ActivityStatusDetail>
                        {status.detail}
                      </ActivityStatusDetail>
                    )}
                    {job.statusError && (
                      <ErrorText role="status">
                        {_('Status check failed; retrying: {{error}}', {
                          error: job.statusError.message,
                        })}
                      </ErrorText>
                    )}
                    {job.cancelError && (
                      <ErrorText role="alert">
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
                        <Row gap={4} style={{gridColumn: 2}} wrap="nowrap">
                          {canCancel && (
                            <CircleXDeleteIcon
                              aria-label={cancelTitle}
                              color={Theme.darkRed}
                              title={cancelTitle}
                              onClick={() => cancel(job.key)}
                            />
                          )}
                          {actions.download && (
                            <DownloadIcon
                              aria-label={_('Download report')}
                              color={Theme.darkGreen}
                              title={_('Download report')}
                              onClick={() => download(job.key)}
                            />
                          )}
                          {actions.retry && (
                            <RefreshIcon
                              aria-label={_('Retry')}
                              color={Theme.blue}
                              title={_('Retry')}
                              onClick={() => retry(job.key)}
                            />
                          )}
                          {actions.dismiss && (
                            <XIcon
                              aria-label={_('Remove from activity')}
                              color={Theme.darkGray}
                              title={_('Remove from activity')}
                              onClick={() => dismiss(job.key)}
                            />
                          )}
                        </Row>
                      </ActivityActions>
                    )}
                  </Column>
                </ActivityJob>
              );
            })}
          </Column>
        </ActivityDropdown>
      </Popover.Dropdown>
    </Popover>
  );
};

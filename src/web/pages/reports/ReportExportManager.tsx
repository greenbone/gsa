/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from 'react';
import {ActionIcon, Group, Loader, Popover, Stack, Text} from '@mantine/core';
import {showSuccessNotification} from '@greenbone/ui-lib';
import styled from 'styled-components';
import Button from 'web/components/form/Button';
import {
  AlertCircleIcon,
  CheckIcon,
  CircleXDeleteIcon,
  DownloadIcon,
  ScheduleIcon,
  XIcon,
} from 'web/components/icon';
import Link from 'web/components/link/Link';
import CapabilitiesContext from 'web/components/provider/CapabilitiesProvider';
import useReportExport, {
  type ReportExportJob,
  type StartDirectReportDownloadParams,
  type StartReportExportParams,
} from 'web/hooks/useReportExport';
import useTranslation, {type TranslateFunc} from 'web/hooks/useTranslation';
import Theme from 'web/utils/theme';

interface ReportExportManagerContextValue {
  start: (params: StartReportExportParams) => Promise<boolean>;
  startDirect: (params: StartDirectReportDownloadParams) => boolean;
  cancel: (key: string) => Promise<void>;
  dismiss: (key: string) => void;
  isActive: boolean;
  supportsCancellation: boolean;
  activityOpen: boolean;
  setActivityOpen: Dispatch<SetStateAction<boolean>>;
  jobs: ReportExportJob[];
}

interface ReportExportManagerProps {
  children: ReactNode;
}

const ReportExportManagerContext = createContext<
  ReportExportManagerContextValue | undefined
>(undefined);

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
  background: ${props => {
    if (props.$tone === 'active') return Theme.reportActivityActiveBackground;
    if (props.$tone === 'queued') return Theme.reportActivityQueuedBackground;
    if (props.$tone === 'downloading') {
      return Theme.reportActivityDownloadingBackground;
    }
    if (props.$tone === 'error') return Theme.reportActivityErrorBackground;
    if (props.$tone === 'ready') return Theme.reportActivityReadyBackground;
    return Theme.reportActivityCanceledBackground;
  }};
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
  background: ${Theme.reportActivityRowBackground};
  border: 1px solid ${Theme.lightGray};
  border-radius: 6px;
  min-width: 0;
  padding: 10px;
`;

const ActivityActions = styled.div`
  align-items: center;
  border-top: 1px solid ${Theme.lightGray};
  display: flex;
  flex-wrap: wrap;
  gap: 8px 12px;
  justify-content: space-between;
  padding-top: 8px;
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
        label: _('Export failed'),
        detail: job.state.error.message,
        tone: 'error',
        icon: 'error',
      };
    case 'done':
      return {
        label: job.downloadStarted ? _('Export complete') : _('Ready'),
        tone: 'ready',
        icon: 'ready',
      };
    case 'downloaded':
      return {
        label: _('Export complete'),
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
  if (job.state.exportData?.progress === 'queued') {
    return {
      label: _('Queued'),
      tone: 'queued',
      icon: 'queued',
    };
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
    isActive,
    jobs,
    setActivityOpen,
    supportsCancellation,
  } = useReportExportManager();
  const [_] = useTranslation();
  const previousJobKeys = useRef(new Set(jobs.map(job => job.key)));

  useEffect(() => {
    if (jobs.some(job => !previousJobKeys.current.has(job.key))) {
      setActivityOpen(true);
    }
    previousJobKeys.current = new Set(jobs.map(job => job.key));
  }, [jobs, setActivityOpen]);

  if (jobs.length === 0) return null;

  const hasError = jobs.some(
    job => job.state.status === 'error' || job.cancelError || job.downloadError,
  );
  let indicatorState: 'error' | 'active' | 'complete' = 'complete';
  if (isActive) indicatorState = 'active';
  if (hasError) indicatorState = 'error';

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
      onChange={setActivityOpen}
    >
      <Popover.Target>
        <ActionIcon
          aria-label={_('Report export activity')}
          data-testid="report-export-activity-button"
          style={{position: 'relative'}}
          title={_('Report export activity')}
          variant="transparent"
          onClick={() => setActivityOpen(value => !value)}
        >
          <DownloadIcon color={Theme.white} />
          <ActivityDot $state={indicatorState} />
        </ActionIcon>
      </Popover.Target>
      <Popover.Dropdown data-testid="report-export-activity-popover">
        <ActivityDropdown>
          <Stack gap="sm">
            <Group justify="space-between" wrap="nowrap">
              <Text fw={600} size="sm">
                {_('Report exports ({{count}})', {count: jobs.length})}
              </Text>
              <ActionIcon
                aria-label={_('Close export activity')}
                size="sm"
                variant="subtle"
                onClick={() => setActivityOpen(false)}
              >
                <XIcon />
              </ActionIcon>
            </Group>
            {jobs.map(job => {
              const {state} = job;
              const canCancel =
                supportsCancellation &&
                !job.directDownload &&
                (state.status === 'creating' ||
                  state.status === 'checking' ||
                  state.status === 'pending' ||
                  state.status === 'running' ||
                  job.downloadPending);
              const jobIsActive =
                state.status === 'creating' ||
                state.status === 'checking' ||
                state.status === 'pending' ||
                state.status === 'running' ||
                state.status === 'cancel_requested' ||
                job.downloadPending ||
                job.directPending ||
                job.cancelPending;
              const status = getActivityStatusPresentation(job, _);
              const isStatusError = status.tone === 'error';

              return (
                <ActivityJob key={job.key}>
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
                      (jobIsActive && canCancel) ||
                      !jobIsActive) && (
                      <ActivityActions>
                        {job.reportUrl && (
                          <Link to={job.reportUrl}>
                            {_('View report details')}
                          </Link>
                        )}
                        {jobIsActive && canCancel && (
                          <Button
                            disabled={!canCancel || job.cancelPending}
                            title={getCancelButtonTitle(job, _)}
                            onClick={() => void cancel(job.key)}
                          />
                        )}
                        {!jobIsActive && (
                          <Button
                            title={_('Remove from activity')}
                            onClick={() => dismiss(job.key)}
                          />
                        )}
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

const ReportExportManager = ({children}: ReportExportManagerProps) => {
  const [_] = useTranslation();
  const [activityOpen, setActivityOpen] = useState(false);
  const activityOpenRef = useRef(activityOpen);
  useEffect(() => {
    activityOpenRef.current = activityOpen;
  }, [activityOpen]);
  const capabilities = useContext(CapabilitiesContext);
  const supportsCancellation =
    capabilities?.mayOp('cancel_report_export') ?? false;
  const handleDownload = useCallback(
    (data: ArrayBuffer | string, filename: string) => {
      const url = window.URL.createObjectURL(new Blob([data]));
      const anchor = document.createElement('a');
      anchor.download = filename;
      anchor.href = url;
      anchor.style.display = 'none';
      anchor.addEventListener('click', event => event.stopPropagation(), {
        once: true,
      });
      document.body.append(anchor);
      anchor.click();
      window.setTimeout(() => {
        anchor.remove();
        window.URL.revokeObjectURL(url);
      }, 1000);
      if (!activityOpenRef.current) {
        showSuccessNotification('', _('Report download started.'));
      }
    },
    [_],
  );
  const reportExport = useReportExport({
    onDownload: handleDownload,
    activityOpen,
  });
  const cancel = useCallback(
    (key: string) =>
      supportsCancellation ? reportExport.cancel(key) : Promise.resolve(),
    [reportExport, supportsCancellation],
  );
  const contextValue = useMemo(
    () => ({
      start: reportExport.start,
      startDirect: reportExport.startDirect,
      cancel,
      dismiss: reportExport.dismiss,
      isActive: reportExport.isActive,
      supportsCancellation,
      activityOpen,
      setActivityOpen,
      jobs: reportExport.jobs,
    }),
    [activityOpen, cancel, reportExport, setActivityOpen, supportsCancellation],
  );

  return (
    <ReportExportManagerContext.Provider value={contextValue}>
      {children}
    </ReportExportManagerContext.Provider>
  );
};

export const useReportExportManager = () => {
  const context = useContext(ReportExportManagerContext);
  if (!context) {
    throw new Error(
      'useReportExportManager must be used within ReportExportManager',
    );
  }
  return context;
};

export default ReportExportManager;

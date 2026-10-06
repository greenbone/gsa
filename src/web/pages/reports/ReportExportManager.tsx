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
  type ReactNode,
} from 'react';
import {ActionIcon, Group, Popover, Stack, Text} from '@mantine/core';
import {showSuccessNotification} from '@greenbone/ui-lib';
import styled from 'styled-components';
import Button from 'web/components/form/Button';
import {DownloadIcon, XIcon} from 'web/components/icon';
import Link from 'web/components/link/Link';
import CapabilitiesContext from 'web/components/provider/CapabilitiesProvider';
import useReportExport, {
  type ReportExportJob,
  type ReportExportState,
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

const ActivityStatus = styled(Text)`
  overflow-wrap: anywhere;
`;

const ActivityJob = styled.div`
  min-width: 0;
  padding-top: 12px;
  &:not(:first-child) {
    border-top: 1px solid ${Theme.lightGray};
  }
`;

const ErrorText = styled(Text)`
  color: ${Theme.darkRed};
`;

const getStatusText = (
  state: ReportExportState,
  downloadStarted: boolean,
  translate: TranslateFunc,
) => {
  if (state.status === 'creating') return translate('Preparing report export');
  if (state.status === 'checking') {
    return translate('Checking export status');
  }
  if (state.status === 'pending' || state.exportData?.progress === 'queued') {
    return translate('Queued');
  }
  if (state.status === 'running' && !state.exportData?.progress) {
    return translate('Generating report');
  }
  if (state.status === 'cancel_requested') {
    return translate('Cancellation requested');
  }
  if (state.status === 'error') return state.error.message;
  if (state.status === 'done') {
    return downloadStarted
      ? translate('Download started')
      : translate('Preparing download');
  }
  if (state.status === 'canceled') return translate('Export canceled');
  if (state.exportData?.progress) {
    return translate('Progress: {{progress}}', {
      progress: state.exportData.progress,
    });
  }
  return translate('Status: {{status}}', {status: state.status});
};

export const ReportExportActivity = () => {
  const {cancel, dismiss, isActive, jobs, supportsCancellation} =
    useReportExportManager();
  const [_] = useTranslation();
  const [opened, setOpened] = useState(false);
  const previousJobCount = useRef(jobs.length);

  useEffect(() => {
    if (jobs.length > previousJobCount.current) {
      setOpened(true);
    }
    previousJobCount.current = jobs.length;
  }, [jobs.length]);

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
      opened={opened}
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
      onChange={setOpened}
    >
      <Popover.Target>
        <ActionIcon
          aria-label={_('Report export activity')}
          data-testid="report-export-activity-button"
          style={{position: 'relative'}}
          title={_('Report export activity')}
          variant="transparent"
          onClick={() => setOpened(value => !value)}
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
                onClick={() => setOpened(false)}
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
              const isStatusError =
                state.status === 'error' || Boolean(job.downloadError);
              const statusText = job.directPending
                ? _('Downloading report')
                : job.downloadError
                  ? _('Download failed: {{error}}', {
                      error: job.downloadError.message,
                    })
                  : getStatusText(state, job.downloadStarted, _);

              return (
                <ActivityJob key={job.key}>
                  <Stack gap="xs">
                    <Text fw={600} size="sm">
                      {job.reportTitle
                        ? job.directDownload
                          ? _('Report download: {{report}}', {
                              report: job.reportTitle,
                            })
                          : _('Report export: {{report}}', {
                              report: job.reportTitle,
                            })
                        : job.directDownload
                          ? _('Report download')
                          : _('Report export')}
                    </Text>
                    <ActivityStatus
                      aria-live={jobIsActive ? 'polite' : undefined}
                      role={isStatusError ? 'alert' : 'status'}
                      size="sm"
                    >
                      {statusText}
                    </ActivityStatus>
                    {job.reportUrl && (
                      <Link to={job.reportUrl}>{_('View report')}</Link>
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
                    {jobIsActive && canCancel && (
                      <Button
                        disabled={!canCancel || job.cancelPending}
                        title={
                          job.cancelPending
                            ? _('Cancellation requested')
                            : job.cancelError
                              ? _('Retry cancellation')
                              : _('Cancel report export')
                        }
                        onClick={() => void cancel(job.key)}
                      />
                    )}
                    {!jobIsActive && (
                      <Button
                        title={_('Remove from activity')}
                        onClick={() => dismiss(job.key)}
                      />
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
      showSuccessNotification('', _('Report download started.'));
    },
    [_],
  );
  const reportExport = useReportExport({onDownload: handleDownload});
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
      jobs: reportExport.jobs,
    }),
    [cancel, reportExport, supportsCancellation],
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

/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useEffect, useState, useSyncExternalStore} from 'react';
import {useQueries, useQueryClient} from '@tanstack/react-query';
import {v4 as uuid} from 'uuid';
import {
  reportExportQueryOptions,
  useReportExportInventory,
} from 'web/hooks/use-query/report-export-queries';
import useGmp from 'web/hooks/useGmp';
import useSessionToken from 'web/hooks/useSessionToken';
import useUserName from 'web/hooks/useUserName';
import {
  type DirectDownload,
  toDirectDownloadJob,
} from 'web/report-export/direct-download';
import {
  type ReportExportAttempt,
  getReportExportActions,
  isAttemptInStage,
  retainReportExportJobs,
  createReportExportJob,
  isReportExportGenerationActive,
  selectReportExportInventory,
} from 'web/report-export/report-export-job-model';
import {
  createReportExportOperations,
  type ReportExportCallbacks,
} from 'web/report-export/report-export-job-orchestrator';
import {useReportExportMutations} from 'web/report-export/useReportExportMutations';
import {
  createRecoveredReportExportAttempt,
  isValidGmpIdentifier,
} from 'web/report-export/utils/report-export-orchestrator-utils';

export type {
  ReportExportJob,
  ReportExportKind,
  ReportExportJobView,
  StartReportExportParams,
} from 'web/report-export/report-export-job-model';
export {REPORT_EXPORT_POLL_INTERVAL} from 'web/hooks/use-query/report-export-queries';
export {REPORT_EXPORT_DOWNLOAD_RETRY_INTERVAL} from 'web/report-export/report-export-job-orchestrator';

const EMPTY_ATTEMPTS: ReportExportAttempt[] = [];
const EMPTY_DIRECT: DirectDownload[] = [];
const EMPTY_DISMISSED_EXPORTS: ReadonlySet<string> = new Set();

const getReportDownloadIdentity = ({
  reportUrl,
  filename,
}: {
  reportUrl?: string;
  filename: string;
}) => {
  const extensionIndex = filename.lastIndexOf('.');
  if (!reportUrl || extensionIndex <= 0) return undefined;
  const extension = filename.slice(extensionIndex + 1).toLowerCase();
  return extension ? `${reportUrl}\0${extension}` : undefined;
};

const useReportExport = ({onDownload, onError}: ReportExportCallbacks) => {
  const gmp = useGmp();
  const token = useSessionToken();
  const username = useUserName();
  const queryClient = useQueryClient();
  const mutations = useReportExportMutations(username);

  const owner = `${token ?? ''}\0${username ?? ''}`;
  const createSession = () => {
    const sessionScope = uuid();
    return {
      owner,
      sessionScope,
      operations: createReportExportOperations({
        gmp,
        queryClient,
        token,
        username,
        sessionScope,
        callbacks: {onDownload, onError},
        mutations,
      }),
    };
  };
  const [session, setSession] = useState(createSession);
  if (session.owner !== owner) setSession(createSession());
  const {operations, sessionScope} = session;
  const isOwner = session.owner === owner;
  const [dismissedExports, setDismissedExports] = useState(() => ({
    sessionScope,
    ids: new Set<string>(),
  }));
  useEffect(() => {
    operations.setCallbacks({onDownload, onError});
    operations.setMutations(mutations);
  }, [operations, onDownload, onError, mutations]);

  const attempts = useSyncExternalStore(
    operations.store.subscribe,
    operations.store.getSnapshot,
  );
  const downloads = useSyncExternalStore(
    operations.subscribeDirect,
    operations.getDirectDownloads,
  );
  const records = isOwner ? attempts : EMPTY_ATTEMPTS;
  const directDownloads = isOwner ? downloads : EMPTY_DIRECT;

  useEffect(() => {
    operations.activate();
    return () => operations.dispose();
  }, [operations]);

  const inventory = useReportExportInventory(sessionScope);
  useEffect(() => {
    if (!isOwner || !inventory.data) return;
    for (const item of selectReportExportInventory(inventory.data.exports)) {
      if (!isValidGmpIdentifier(item.id)) continue;
      queryClient.setQueryData(
        ['get_report_export', username, sessionScope, item.id],
        item,
      );
    }
  }, [inventory.data, isOwner, queryClient, sessionScope, username]);
  const dismissedIds =
    dismissedExports.sessionScope === sessionScope
      ? dismissedExports.ids
      : EMPTY_DISMISSED_EXPORTS;
  const localExportIds = new Set(
    records.map(attempt => attempt.exportId).filter(Boolean),
  );
  const discoveredAttempts = (
    isOwner ? selectReportExportInventory(inventory.data?.exports ?? []) : []
  )
    .filter(item => isValidGmpIdentifier(item.id))
    .map(createRecoveredReportExportAttempt)
    .filter(
      attempt =>
        !localExportIds.has(attempt.exportId) &&
        !dismissedIds.has(attempt.exportId ?? ''),
    );
  const queryAttempts = [...records, ...discoveredAttempts];

  const statusQueries = useQueries({
    queries: queryAttempts.map(attempt => {
      const cachedExport = queryClient.getQueryData<{status?: string}>([
        'get_report_export',
        username,
        sessionScope,
        attempt.exportId,
      ]);
      const inventoryExport = inventory.data?.exports.find(
        item => item.id === attempt.exportId,
      );
      return {
        ...reportExportQueryOptions(
          gmp,
          token,
          username,
          sessionScope,
          attempt.exportId,
        ),
        initialData: inventoryExport,
        enabled: Boolean(
          token &&
          attempt.exportId &&
          attempt.phase.stage !== 'handed-off' &&
          (attempt.origin !== 'discovered' ||
            isReportExportGenerationActive(
              (inventoryExport ?? cachedExport)?.status,
            )) &&
          !isAttemptInStage(
            attempt.phase,
            'creating',
            'handoff-failed',
            'transferring',
            'failed',
          ),
        ),
      };
    }),
  });

  useEffect(() => {
    operations.sync();
  }, [operations, records, statusQueries]);

  const exportJobs = queryAttempts.map((attempt, index) =>
    createReportExportJob(
      attempt,
      statusQueries[index]?.data,
      statusQueries[index]?.error,
    ),
  );
  const directJobs = directDownloads.map(toDirectDownloadJob);
  const activeDirectIdentities = new Set(
    directDownloads
      .filter(download => download.view.kind !== 'failed')
      .map(getReportDownloadIdentity)
      .filter((identity): identity is string => Boolean(identity)),
  );
  const jobs = [
    ...exportJobs.filter(job => {
      if (job.origin !== 'discovered' || job.view.kind !== 'ready') return true;
      const identity = getReportDownloadIdentity(job);
      return !identity || !activeDirectIdentities.has(identity);
    }),
    ...directJobs,
  ];
  const attemptsByKey = new Map(
    queryAttempts.map(attempt => [attempt.key, attempt]),
  );
  return {
    start: operations.start,
    startDirect: operations.startDirect,
    cancel: (key: string) => operations.cancel(key, attemptsByKey.get(key)),
    dismiss: (key: string) => {
      const job = jobs.find(item => item.key === key);
      operations.dismiss(key);
      if (job?.exportId)
        setDismissedExports(current => ({
          sessionScope,
          ids: new Set([
            ...(current.sessionScope === sessionScope ? current.ids : []),
            job.exportId as string,
          ]),
        }));
    },
    retry: (key: string) => operations.retry(key, attemptsByKey.get(key)),
    download: (key: string) => operations.download(key, attemptsByKey.get(key)),
    refreshDiscovery: operations.refreshInventory,
    jobs: retainReportExportJobs(jobs),
    isActive: jobs.some(job => getReportExportActions(job).active),
    discoveryError: inventory.error,
    discoveryIncomplete: inventory.data?.incomplete ?? false,
  };
};

export default useReportExport;

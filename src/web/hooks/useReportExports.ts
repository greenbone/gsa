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
} from 'web/report-export/report-export-job-model';
import {
  createReportExportOperations,
  type ReportExportCallbacks,
} from 'web/report-export/report-export-job-orchestrator';
import {useReportExportMutations} from 'web/report-export/useReportExportMutations';

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
    if (inventory.data) operations.mergeInventory(inventory.data.exports);
  }, [operations, inventory.data]);

  const statusQueries = useQueries({
    queries: records.map(attempt => {
      const cachedExport = queryClient.getQueryData<{status?: string}>([
        'get_report_export',
        username,
        sessionScope,
        attempt.exportId,
      ]);
      return {
        ...reportExportQueryOptions(
          gmp,
          token,
          username,
          sessionScope,
          attempt.exportId,
        ),
        enabled: Boolean(
          token &&
          attempt.exportId &&
          attempt.phase.stage !== 'handed-off' &&
          (attempt.origin !== 'discovered' ||
            !cachedExport ||
            isReportExportGenerationActive(cachedExport.status)) &&
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

  const exportJobs = records.map((attempt, index) =>
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
  return {
    start: operations.start,
    startDirect: operations.startDirect,
    cancel: operations.cancel,
    dismiss: operations.dismiss,
    retry: operations.retry,
    download: operations.download,
    refreshDiscovery: operations.refreshInventory,
    jobs: retainReportExportJobs(jobs),
    isActive: jobs.some(job => getReportExportActions(job).active),
    discoveryError: inventory.error,
    discoveryIncomplete: inventory.data?.incomplete ?? false,
  };
};

export default useReportExport;

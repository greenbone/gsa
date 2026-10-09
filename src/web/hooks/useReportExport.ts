/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useEffect, useMemo, useState, useSyncExternalStore} from 'react';
import {useQueries, useQueryClient} from '@tanstack/react-query';
import {
  reportExportQueryOptions,
  useReportExportInventory,
} from 'web/hooks/use-query/report-exports';
import useGmp from 'web/hooks/useGmp';
import useSessionToken from 'web/hooks/useSessionToken';
import useUserName from 'web/hooks/useUserName';
import {
  createReportExportController,
  type ReportExportCallbacks,
} from 'web/report-export/controller';
import {
  type DirectDownload,
  toDirectDownloadJob,
} from 'web/report-export/direct-download';
import {
  type ExportAttempt,
  type StartReportExportParams,
  getReportExportActions,
  inStage,
  retainReportExportJobs,
  toReportExportJob,
} from 'web/report-export/job';

export type {
  ReportExportJob,
  ReportExportKind,
  JobView,
  StartReportExportParams,
} from 'web/report-export/job';
export {REPORT_EXPORT_POLL_INTERVAL} from 'web/hooks/use-query/report-exports';
export {REPORT_EXPORT_DOWNLOAD_RETRY_INTERVAL} from 'web/report-export/controller';

const EMPTY_ATTEMPTS: ExportAttempt[] = [];
const EMPTY_DIRECT: DirectDownload[] = [];

const useReportExport = ({onDownload, onError}: ReportExportCallbacks) => {
  const gmp = useGmp();
  const token = useSessionToken();
  const username = useUserName();
  const queryClient = useQueryClient();

  const owner = `${token ?? ''}\0${username ?? ''}`;
  const createSession = () => ({
    owner,
    controller: createReportExportController({
      gmp,
      queryClient,
      token,
      username,
      callbacks: {onDownload, onError},
    }),
  });
  const [session, setSession] = useState(createSession);
  if (session.owner !== owner) setSession(createSession());
  const {controller} = session;
  const isOwner = session.owner === owner;
  useEffect(() => {
    controller.setCallbacks({onDownload, onError});
  }, [controller, onDownload, onError]);

  const attempts = useSyncExternalStore(
    controller.store.subscribe,
    controller.store.getSnapshot,
  );
  const downloads = useSyncExternalStore(
    controller.subscribeDirect,
    controller.getDirectDownloads,
  );
  const records = isOwner ? attempts : EMPTY_ATTEMPTS;
  const directDownloads = isOwner ? downloads : EMPTY_DIRECT;

  useEffect(() => {
    controller.activate();
    return () => controller.dispose();
  }, [controller]);

  const inventory = useReportExportInventory();
  useEffect(() => {
    if (inventory.data) controller.mergeInventory(inventory.data.exports);
  }, [controller, inventory.data]);

  const statusQueries = useQueries({
    queries: records.map(attempt => ({
      ...reportExportQueryOptions(gmp, token, attempt.exportId, attempt.key),
      enabled: Boolean(
        token &&
        attempt.exportId &&
        attempt.disposition === 'awaiting' &&
        !inStage(
          attempt.phase,
          'creating',
          'handoff-failed',
          'transferring',
          'failed',
        ),
      ),
    })),
  });

  useEffect(() => {
    controller.sync();
  }, [controller, records, statusQueries]);

  const actions = useMemo(
    () => ({
      start: (params: StartReportExportParams) => controller.start(params),
      startDirect: (params: StartReportExportParams) =>
        controller.startDirect(params),
      cancel: (key: string) => controller.cancel(key),
      dismiss: (key: string) => controller.dismiss(key),
      retry: (key: string) => controller.retry(key),
      download: (key: string) => controller.download(key),
      refreshDiscovery: controller.refreshInventory,
    }),
    [controller],
  );

  const jobs = [
    ...records.map((attempt, index) =>
      toReportExportJob(
        attempt,
        statusQueries[index]?.data,
        statusQueries[index]?.error,
      ),
    ),
    ...directDownloads.map(toDirectDownloadJob),
  ];
  return {
    ...actions,
    jobs: retainReportExportJobs(jobs),
    isActive: jobs.some(job => getReportExportActions(job).active),
    discoveryError: inventory.error,
    discoveryIncomplete: inventory.data?.incomplete ?? false,
  };
};

export default useReportExport;

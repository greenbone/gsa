/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useQueryClient} from '@tanstack/react-query';
import {v4 as uuid} from 'uuid';
import type Gmp from 'gmp/gmp';
import type ReportExport from 'gmp/models/report-export';
import {isDefined} from 'gmp/utils/identity';
import useGmp from 'web/hooks/useGmp';
import useLatestCallback from 'web/hooks/useLatestCallback';
import useSessionToken from 'web/hooks/useSessionToken';
import useUserName from 'web/hooks/useUserName';
import {
  type ReportExportRecord,
  type StartReportExportParams,
  adoptCreatedExportRecord,
  createReportExportJob,
  getReportExportActions,
  isPermanentReportExportError,
  isReportExportJobFinished,
  retainReportExportRecords,
  shouldAutoDownloadRecord,
} from 'web/report-export/report-export-job-model';
import {useReportExportMutations} from 'web/report-export/useReportExportMutations';
import {
  reportExportQueryKey,
  useReportExportStatusQueries,
} from 'web/report-export/useReportExportQueries';

export interface ReportExportCallbacks {
  onDownload: (
    data: ArrayBuffer | string,
    filename: string,
    mimetype?: string,
  ) => void;
  onError?: (error: Error) => void;
}

export type {
  ReportExportJob,
  ReportExportKind,
  ReportExportJobView,
  StartReportExportParams,
} from 'web/report-export/report-export-job-model';

export const REPORT_EXPORT_DOWNLOAD_RETRY_INTERVAL = 3000;

const toError = (error: unknown) => {
  if (error instanceof Error) return error;
  if (typeof error === 'string') return new Error(error);
  return new Error('Unexpected report export error');
};

// Async continuations must not act after the login session changed. A GMP
// token belongs to exactly one user, so comparing the token is sufficient.
const isLive = (gmp: Pick<Gmp, 'session'>, ownerToken?: string) =>
  isDefined(gmp.session.token) &&
  (ownerToken === undefined || gmp.session.token === ownerToken);

const useReportExport = ({onDownload, onError}: ReportExportCallbacks) => {
  const gmp = useGmp();
  const token = useSessionToken();
  const username = useUserName();
  const queryClient = useQueryClient();
  const mutations = useReportExportMutations();

  const [records, setRecords] = useState<ReportExportRecord[]>([]);
  const inFlightIds = useRef(new Set<string>());
  const cancelingIds = useRef(new Set<string>());
  const disposedRef = useRef(false);
  const recordsRef = useRef<ReportExportRecord[]>([]);
  useEffect(() => {
    recordsRef.current = records;
  }, [records]);
  useEffect(() => {
    disposedRef.current = false;
    return () => {
      disposedRef.current = true;
    };
  }, []);

  const handoffDownload = useLatestCallback(
    (data: ArrayBuffer | string, filename: string, mimetype?: string) => {
      onDownload(data, filename, mimetype);
    },
  );
  const notify = useLatestCallback((error: Error) => {
    onError?.(error);
  });

  // Local activity only makes sense within one login session.
  const lastTokenRef = useRef<string | undefined>(undefined);
  useEffect(() => {
    if (isDefined(lastTokenRef.current) && lastTokenRef.current !== token) {
      setRecords([]);
      inFlightIds.current.clear();
      cancelingIds.current.clear();
      queryClient.removeQueries({queryKey: ['get_report_export']});
    }
    lastTokenRef.current = token;
  }, [token, queryClient]);

  const updateRecord = useCallback(
    (key: string, update: (record: ReportExportRecord) => ReportExportRecord) =>
      setRecords(previous =>
        previous.some(record => record.key === key)
          ? previous.map(record =>
              record.key === key ? update(record) : record,
            )
          : previous,
      ),
    [],
  );

  const removeRecord = useCallback(
    (key: string) =>
      setRecords(previous =>
        previous.some(record => record.key === key)
          ? previous.filter(record => record.key !== key)
          : previous,
      ),
    [],
  );

  // Retention prunes the tracked records themselves so finished history
  // beyond the limit cannot keep status query observers or cache entries
  // alive. The record state is adjusted during render (React's documented
  // derived-state pattern): the prune only removes records, so the
  // adjustment converges after a single re-render.
  const retainedRecords = retainReportExportRecords(records, record => {
    const state = isDefined(record.exportId)
      ? queryClient.getQueryState(
          reportExportQueryKey(token, username, record.exportId),
        )
      : undefined;
    return {
      data: state?.data as ReportExport | undefined,
      error: state?.error ?? undefined,
    };
  });
  if (retainedRecords.length !== records.length) {
    setRecords(retainedRecords);
  }

  const statusQueries = useReportExportStatusQueries(retainedRecords);
  const exportById = useMemo(() => {
    const exports = new Map<string, ReportExport>();
    retainedRecords.forEach((record, index) => {
      const data = statusQueries[index]?.data;
      if (isDefined(record.exportId) && isDefined(data)) {
        exports.set(record.exportId, data);
      }
    });
    return exports;
  }, [retainedRecords, statusQueries]);

  const jobsByKey = useMemo(
    () =>
      new Map(
        retainedRecords
          .map((record, index) =>
            createReportExportJob(
              record,
              isDefined(record.exportId)
                ? exportById.get(record.exportId)
                : undefined,
              statusQueries[index]?.error,
            ),
          )
          .map(job => [job.key, job] as const),
      ),
    [retainedRecords, exportById, statusQueries],
  );

  const requestCancellation = useLatestCallback(
    async (key: string, exportId: string) => {
      // one cancellation request at a time per export
      if (cancelingIds.current.has(exportId)) return;
      cancelingIds.current.add(exportId);
      const ownerToken = gmp.session.token;
      try {
        await mutations.cancel(exportId);
        if (isLive(gmp, ownerToken))
          updateRecord(key, current => ({
            ...current,
            cancelRequested: false,
            cancelError: undefined,
          }));
      } catch (error) {
        if (isLive(gmp, ownerToken)) {
          const failure = toError(error);
          updateRecord(key, current => ({
            ...current,
            cancelRequested: false,
            cancelError: failure,
          }));
          notify(failure);
        }
      } finally {
        cancelingIds.current.delete(exportId);
        if (isLive(gmp, ownerToken)) {
          // not awaited: invalidation must not block on a refetch whose
          // query may still be waiting for a pending response
          queryClient
            .invalidateQueries({
              queryKey: reportExportQueryKey(token, username, exportId),
            })
            .catch(() => {});
        }
      }
    },
  );

  const handoff = (
    record: ReportExportRecord,
    data: ArrayBuffer | string,
    mimetype?: string,
  ) => {
    const {key, filename} = record;
    const reportExportId = record.exportId;
    if (!isDefined(reportExportId)) return;
    try {
      handoffDownload(data, filename, mimetype);
    } catch (error) {
      inFlightIds.current.delete(reportExportId);
      const failure = toError(error);
      updateRecord(key, current => ({
        ...current,
        downloading: false,
        downloaded: false,
        downloadError: failure,
      }));
      notify(failure);
      return;
    }
    inFlightIds.current.delete(reportExportId);
    updateRecord(key, current => ({
      ...current,
      downloading: false,
      downloaded: true,
      downloadError: undefined,
    }));
  };

  // after the retry delay, the resumed attempt must still be meaningful:
  // the session must be alive, the hook mounted, and the export tracked
  const canResumeRetry = (
    ownerToken: string | undefined,
    reportExportId: string,
  ) =>
    isLive(gmp, ownerToken) &&
    !disposedRef.current &&
    recordsRef.current.some(item => item.exportId === reportExportId);

  const attemptDownload = useLatestCallback(
    // a named function expression so the automatic retry can re-enter itself
    async function retryableDownload(
      key: string,
      reportExportId: string,
      mimetype?: string,
      retried = false,
    ) {
      if (inFlightIds.current.has(reportExportId)) return;
      const record = recordsRef.current.find(item => item.key === key);
      if (!record) return;
      inFlightIds.current.add(reportExportId);
      updateRecord(key, current => ({
        ...current,
        downloading: true,
        downloadError: undefined,
      }));
      const ownerToken = gmp.session.token;
      try {
        const response = await mutations.download(reportExportId);
        if (!isLive(gmp, ownerToken)) return;
        handoff(record, response.data, mimetype);
      } catch (error) {
        if (!isLive(gmp, ownerToken)) return;
        const failure = toError(error);
        if (!isPermanentReportExportError(failure) && !retried) {
          // single automatic retry; the bytes were not received yet. a
          // manual retry during the wait is a no-op (still in flight).
          await new Promise(resolve =>
            setTimeout(resolve, REPORT_EXPORT_DOWNLOAD_RETRY_INTERVAL),
          );
          if (!canResumeRetry(ownerToken, reportExportId)) return;
          inFlightIds.current.delete(reportExportId);
          await retryableDownload(key, reportExportId, undefined, true);
          return;
        }
        updateRecord(key, current => ({
          ...current,
          downloading: false,
          downloadError: failure,
        }));
        notify(failure);
      } finally {
        inFlightIds.current.delete(reportExportId);
      }
    },
  );

  // Replay a cancellation that was queued while the export id did not exist
  // yet, whenever the record becomes bound.
  useEffect(() => {
    for (const record of retainedRecords) {
      if (!isDefined(record.exportId) || !record.cancelRequested) continue;
      requestCancellation(record.key, record.exportId).catch(() => {});
    }
  }, [retainedRecords, requestCancellation]);

  // Pick up completed tracked exports and hand their file to the browser.
  useEffect(() => {
    for (const record of retainedRecords) {
      const exportId = record.exportId;
      if (!isDefined(exportId)) continue;
      const item = exportById.get(exportId);
      if (!shouldAutoDownloadRecord(record, item)) continue;
      attemptDownload(
        record.key,
        exportId,
        item?.contentType ?? undefined,
      ).catch(() => {});
    }
  }, [retainedRecords, exportById, attemptDownload]);

  const start = useLatestCallback(async (params: StartReportExportParams) => {
    if (!isLive(gmp)) {
      return false;
    }
    const ownerToken = gmp.session.token;
    const key = `report-export-${uuid()}`;
    setRecords(previous => [
      ...previous,
      {
        key,
        filename: params.filename,
        reportTitle: params.reportTitle,
        reportUrl: params.reportUrl,
      },
    ]);
    try {
      const response = await mutations.create({
        kind: params.kind,
        payload: params.payload,
      });
      if (!isLive(gmp, ownerToken)) {
        removeRecord(key);
        return false;
      }
      // gvmd reuses only pending/running exports, so an identical request
      // can return the id of an export this client already tracks.
      setRecords(previous =>
        adoptCreatedExportRecord(previous, key, response.data.id, params),
      );
      return true;
    } catch (error) {
      if (!isLive(gmp, ownerToken)) {
        removeRecord(key);
        return false;
      }
      const failure = toError(error);
      updateRecord(key, current => ({...current, createError: failure}));
      notify(failure);
      return false;
    }
  });

  const cancel = useLatestCallback(async (key: string) => {
    const job = jobsByKey.get(key);
    const record = recordsRef.current.find(item => item.key === key);
    if (!job || !record || !getReportExportActions(job).cancel) return;
    if (!isDefined(record.exportId)) {
      // gvmd only accepts cancellation for existing exports; queue it until
      // the id is known
      updateRecord(key, current => ({...current, cancelRequested: true}));
      return;
    }
    await requestCancellation(record.key, record.exportId);
  });

  const dismiss = useLatestCallback((key: string) => {
    const job = jobsByKey.get(key);
    if (!job || !getReportExportActions(job).dismiss) return;
    removeRecord(key);
  });

  const clearFinished = useLatestCallback(() => {
    setRecords(previous =>
      previous.filter(record => {
        const job = jobsByKey.get(record.key);
        return !job || !isReportExportJobFinished(job);
      }),
    );
  });

  const retry = useLatestCallback(async (key: string) => {
    const job = jobsByKey.get(key);
    if (!job || !getReportExportActions(job).retry) return;
    if (isDefined(job.exportId) && job.view.kind === 'failed') {
      if (job.view.reason === 'status') {
        // the status check itself failed; a re-download cannot recover a
        // missing export, but re-checking can resume it
        await queryClient.refetchQueries({
          queryKey: reportExportQueryKey(token, username, job.exportId),
        });
        return;
      }
      // a re-download is always possible: gvmd retains the generated file
      await attemptDownload(key, job.exportId, undefined, false);
    }
  });

  const jobs = [...jobsByKey.values()];

  // Remove the status queries of records that left the tracked set, so
  // pruned or dismissed history does not leave cache entries behind.
  const previousRecordsRef = useRef<ReportExportRecord[]>([]);
  useEffect(() => {
    const previous = previousRecordsRef.current;
    previousRecordsRef.current = records;
    const trackedKeys = new Set(records.map(record => record.key));
    for (const record of previous) {
      if (trackedKeys.has(record.key) || !isDefined(record.exportId)) continue;
      queryClient.removeQueries({
        queryKey: reportExportQueryKey(token, username, record.exportId),
      });
    }
  }, [records, queryClient, token, username]);

  return {
    start,
    cancel,
    dismiss,
    retry,
    clearFinished,
    jobs,
    isActive: jobs.some(job => getReportExportActions(job).active),
  };
};

export default useReportExport;

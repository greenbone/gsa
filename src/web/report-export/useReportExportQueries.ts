/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {queryOptions, useQueries} from '@tanstack/react-query';
import {isReportExportStatusActive} from 'gmp/models/report-export';
import {isDefined} from 'gmp/utils/identity';
import {USE_DEFAULT_RELOAD_INTERVAL_ACTIVE} from 'web/components/loading/Reload';
import useGmp from 'web/hooks/useGmp';
import useSessionToken from 'web/hooks/useSessionToken';
import useUserName from 'web/hooks/useUserName';
import {resolveRefetchInterval} from 'web/queries/helpers';
import {
  isPermanentReportExportError,
  ReportExportUnavailableError,
  type ReportExportRecord,
} from 'web/report-export/report-export-job-model';

export const reportExportQueryId = 'get_report_export';

export const reportExportQueryKey = (
  token?: string,
  username?: string,
  id?: string,
) => [reportExportQueryId, token, username, id];

// Status of a single report export, polled while the export is still being
// generated. Token-scoped so a session switch never reads another session's
// cache entries.
export const reportExportQueryOptions = (
  gmp: {
    reportexport: Pick<ReturnType<typeof useGmp>['reportexport'], 'get'>;
  },
  token: string | undefined,
  username: string | undefined,
  settings: {
    reloadInterval: number;
    reloadIntervalActive: number;
    reloadIntervalInactive: number;
  },
  id?: string,
) =>
  queryOptions({
    queryKey: reportExportQueryKey(token, username, id),
    enabled: Boolean(token && username && id),
    queryFn: async () => {
      if (!id)
        throw new ReportExportUnavailableError('Report export ID is missing');
      const response = await gmp.reportexport.get({reportExportId: id});
      const reportExport = response.data;
      if (!isDefined(reportExport) || reportExport.id !== id)
        throw new ReportExportUnavailableError(
          'Report export is no longer available',
        );
      return reportExport;
    },
    retry: (count, error) => !isPermanentReportExportError(error) && count < 2,
    retryDelay: (count: number) => Math.min(1000 * 2 ** count, 30000),
    refetchInterval: query => {
      if (isPermanentReportExportError(query.state.error)) return false;
      if (query.state.error) return settings.reloadIntervalActive;
      return !query.state.data ||
        isReportExportStatusActive(query.state.data.status)
        ? resolveRefetchInterval(USE_DEFAULT_RELOAD_INTERVAL_ACTIVE, settings)
        : false;
    },
  });

// Status queries for every tracked export at once.
export const useReportExportStatusQueries = (records: ReportExportRecord[]) => {
  const gmp = useGmp();
  const token = useSessionToken();
  const username = useUserName();
  return useQueries({
    queries: records.map(record => {
      const options = reportExportQueryOptions(
        gmp,
        token,
        username,
        gmp.settings,
        record.exportId,
      );
      return {
        ...options,
        enabled:
          options.enabled &&
          isDefined(record.exportId) &&
          !isDefined(record.createError) &&
          !record.downloading &&
          !record.downloaded,
      };
    }),
  });
};

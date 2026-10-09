/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {queryOptions, useQuery} from '@tanstack/react-query';
import QueryFilter from 'gmp/models/filter/query-filter';
import {type ReportExport} from 'gmp/models/report-export';
import useGmp from 'web/hooks/useGmp';
import useSessionToken from 'web/hooks/useSessionToken';
import useUserName from 'web/hooks/useUserName';
import {
  isGenerationActive,
  isPermanentExportError,
  ReportExportUnavailableError,
} from 'web/report-export/job';

// gvmd's export scheduler checks its queue once per second
export const REPORT_EXPORT_POLL_INTERVAL = 1000;

export const reportExportQueryOptions = (
  gmp: Pick<ReturnType<typeof useGmp>, 'reportexport'>,
  token: string | undefined,
  id?: string,
  attemptKey?: string,
) =>
  queryOptions({
    queryKey: ['get_report_export', token, id, attemptKey],
    enabled: Boolean(token && id),
    queryFn: async () => {
      if (!id)
        throw new ReportExportUnavailableError('Report export ID is missing');
      const response = await gmp.reportexport.getReportExport({
        reportExportId: id,
      });
      const reportExport = response.data.find(item => item?.id === id);
      if (!reportExport)
        throw new ReportExportUnavailableError(
          'Report export is no longer available',
        );
      return reportExport;
    },
    retry: (count, error) => !isPermanentExportError(error) && count < 2,
    retryDelay: (count: number) => Math.min(1000 * 2 ** count, 30000),
    refetchInterval: query => {
      if (isPermanentExportError(query.state.error)) return false;
      if (query.state.error) return 5000;
      return !query.state.data || isGenerationActive(query.state.data.status)
        ? REPORT_EXPORT_POLL_INTERVAL
        : false;
    },
  });

export const discoverReportExports = async (
  command: Pick<ReturnType<typeof useGmp>['reportexport'], 'getReportExports'>,
  username: string,
  signal?: AbortSignal,
) => {
  const exports = new Map<string, ReportExport>();
  let first = 1;
  let total: number | undefined;
  for (let page = 0; page < 100; page++) {
    signal?.throwIfAborted();
    const filter = new QueryFilter()
      .set('owner', username)
      .set('first', first)
      .set('rows', 100)
      .set('sort', 'id');
    const response = await command.getReportExports({filter});
    signal?.throwIfAborted();
    const counts = response.meta.counts;
    if (
      counts.first !== first ||
      (total !== undefined && total !== counts.filtered)
    ) {
      return {exports: [...exports.values()], incomplete: true};
    }
    total = counts.filtered;
    let added = 0;
    for (const item of response.data) {
      if (item.id && item.owner?.name === username && !exports.has(item.id)) {
        exports.set(item.id, item);
        added++;
      }
    }
    if (!counts.hasNext())
      return {exports: [...exports.values()], incomplete: false};
    if (!added || counts.last < first)
      return {exports: [...exports.values()], incomplete: true};
    first = counts.last + 1;
  }
  return {exports: [...exports.values()], incomplete: true};
};

export const useReportExportInventory = () => {
  const gmp = useGmp();
  const token = useSessionToken();
  const username = useUserName();
  return useQuery({
    queryKey: ['get_report_exports', token, username],
    enabled: Boolean(token && username),
    queryFn: ({signal}) => {
      if (!username)
        throw new ReportExportUnavailableError('No authenticated user');
      return discoverReportExports(gmp.reportexport, username, signal);
    },
    retry: (count, error) => !isPermanentExportError(error) && count < 2,
    refetchOnWindowFocus: true,
    refetchInterval: false,
  });
};

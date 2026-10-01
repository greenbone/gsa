/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useQuery} from '@tanstack/react-query';
import {
  REPORT_EXPORT_STATUS,
  type ReportExport,
} from 'gmp/models/report-export';
import useGmp from 'web/hooks/useGmp';
import useSessionToken from 'web/hooks/useSessionToken';
import {
  resolveRefetchInterval,
  transformRefetchIntervalFn,
  type RefetchIntervalFn,
} from 'web/queries/helpers';

export const REPORT_EXPORT_POLL_INTERVAL = 3000;

interface UseGetReportExportParams {
  id?: string;
  refetchInterval?: number | false | RefetchIntervalFn<ReportExport>;
}

const useGetReportExport = ({
  id,
  refetchInterval,
}: UseGetReportExportParams) => {
  const gmp = useGmp();
  const token = useSessionToken();
  const settings = gmp.settings;
  const resolvedRefetchInterval =
    typeof refetchInterval === 'function'
      ? transformRefetchIntervalFn(refetchInterval, settings)
      : resolveRefetchInterval(refetchInterval, settings);

  return useQuery<ReportExport>({
    enabled: Boolean(token) && Boolean(id),
    queryKey: ['get_report_export', token, id],
    queryFn: async () => {
      const response = await gmp.reportexport.getReportExports({
        reportExportId: id as string,
      });
      const reportExport = response.data[0];
      if (!reportExport) {
        throw new Error(`Report export ${id} was not found`);
      }
      return reportExport;
    },
    refetchIntervalInBackground: true,
    refetchInterval: resolvedRefetchInterval,
  });
};

export const useGetActiveReportExport = (id?: string) =>
  useGetReportExport({
    id,
    refetchInterval: reportExport =>
      reportExport?.status === REPORT_EXPORT_STATUS.pending ||
      reportExport?.status === REPORT_EXPORT_STATUS.running ||
      reportExport?.status === REPORT_EXPORT_STATUS.cancelRequested
        ? REPORT_EXPORT_POLL_INTERVAL
        : false,
  });

export default useGetReportExport;

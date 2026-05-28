/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type Filter from 'gmp/models/filter';
import type ReportPort from 'gmp/models/report/port';
import useGmp from 'web/hooks/useGmp';
import useGetEntities from 'web/queries/useGetEntities';

interface UseGetReportPortsParams {
  reportId: string;
  filter?: Filter;
  refetchInterval?: number | false;
}

export const useGetReportPorts = ({
  reportId,
  filter = undefined,
  refetchInterval = undefined,
}: UseGetReportPortsParams) => {
  const gmp = useGmp();

  return useGetEntities<ReportPort>({
    gmpMethod: ({filter: reportFilter}) =>
      gmp.reportports.get({
        report_id: reportId,
        filter: reportFilter,
      }),
    queryId: `get_report_ports_${reportId}`,
    filter,
    enabled: Boolean(reportId),
    keepPreviousData: true,
    refetchInterval,
  });
};

export default useGetReportPorts;

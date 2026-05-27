/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type Filter from 'gmp/models/filter';
import useGmp from 'web/hooks/useGmp';
import useGetEntities from 'web/queries/useGetEntities';

interface UseGetReportClosedCvesParams {
  reportId: string;
  filter?: Filter;
  refetchInterval?: number | false;
}

export const useGetReportClosedCves = ({
  reportId,
  filter = undefined,
  refetchInterval = false,
}: UseGetReportClosedCvesParams) => {
  const gmp = useGmp();

  return useGetEntities({
    gmpMethod: ({filter: reportFilter}) =>
      gmp.reportclosedcves.get({
        report_id: reportId,
        filter: reportFilter,
      }),
    queryId: `get_report_closed_cves_${reportId}`,
    filter,
    refetchInterval,
    enabled: Boolean(reportId),
    keepPreviousData: true,
  });
};

export default useGetReportClosedCves;

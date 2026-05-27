/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type Filter from 'gmp/models/filter';
import useGmp from 'web/hooks/useGmp';
import useGetEntities from 'web/queries/useGetEntities';

interface UseGetReportCvesParams {
  reportId: string;
  filter?: Filter;
  refetchInterval?: number | false;
}

export const useGetReportCves = ({
  reportId,
  filter = undefined,
  refetchInterval = false,
}: UseGetReportCvesParams) => {
  const gmp = useGmp();

  return useGetEntities({
    gmpMethod: ({filter: reportFilter}) =>
      gmp.reportcves.get({
        report_id: reportId,
        filter: reportFilter,
      }),
    queryId: `get_report_cves_${reportId}`,
    filter,
    refetchInterval,
    enabled: Boolean(reportId),
    keepPreviousData: true,
  });
};

export default useGetReportCves;

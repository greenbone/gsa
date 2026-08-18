/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {type FilterType} from 'gmp/models/filter';
import useGmp from 'web/hooks/useGmp';
import useGetEntities from 'web/queries/useGetEntities';

interface UseGetReportHostsParams {
  reportId: string;
  filter?: FilterType;
  refetchInterval?: number | false;
  staleTime?: number;
}

export const useGetReportHosts = ({
  reportId,
  filter = undefined,
  refetchInterval = undefined,
  staleTime,
}: UseGetReportHostsParams) => {
  const gmp = useGmp();

  return useGetEntities({
    gmpMethod: ({filter: reportFilter}) =>
      gmp.reporthosts.get({
        report_id: reportId,
        filter: reportFilter,
      }),
    queryId: `get_report_hosts_${reportId}`,
    filter,
    refetchInterval,
    enabled: Boolean(reportId),
    keepPreviousData: true,
    staleTime,
  });
};

export default useGetReportHosts;

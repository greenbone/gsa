/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type Filter from 'gmp/models/filter';
import type ReportOperatingSystem from 'gmp/models/report/os';
import useGmp from 'web/hooks/useGmp';
import useGetEntities from 'web/queries/useGetEntities';

interface UseGetReportOperatingSystemsParams {
  reportId: string;
  filter?: Filter;
  refetchInterval?: number | false;
}

export const useGetReportOperatingSystems = ({
  reportId,
  filter,
  refetchInterval = undefined,
}: UseGetReportOperatingSystemsParams) => {
  const gmp = useGmp();

  return useGetEntities<ReportOperatingSystem>({
    gmpMethod: ({filter: reportFilter}) =>
      gmp.reportoperatingsystems.get({
        report_id: reportId,
        filter: reportFilter,
      }),
    queryId: `get_report_operating_systems_${reportId}`,
    filter,
    enabled: Boolean(reportId),
    keepPreviousData: true,
    refetchInterval,
  });
};

export default useGetReportOperatingSystems;

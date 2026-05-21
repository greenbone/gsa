/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type Filter from 'gmp/models/filter';
import useGmp from 'web/hooks/useGmp';
import useGetEntities from 'web/queries/useGetEntities';

interface UseGetReportApplicationsParams {
  reportId: string;
  filter?: Filter;
  refetchInterval?: number | false;
}

export const useGetReportApplications = ({
  reportId,
  filter = undefined,
  refetchInterval = undefined,
}: UseGetReportApplicationsParams) => {
  const gmp = useGmp();

  return useGetEntities({
    gmpMethod: ({filter: reportFilter}) =>
      gmp.reportapplications.get({
        report_id: reportId,
        filter: reportFilter,
      }),
    queryId: `get_report_applications_${reportId}`,
    filter,
    enabled: Boolean(reportId),
    keepPreviousData: true,
    refetchInterval,
  });
};

export default useGetReportApplications;

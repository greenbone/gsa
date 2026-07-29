/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type AuditReport from 'gmp/models/audit-report';
import {type FilterType} from 'gmp/models/filter';
import type ReportHost from 'gmp/models/report/host';
import useGmp from 'web/hooks/useGmp';
import useGetEntities from 'web/queries/useGetEntities';
import useGetEntity from 'web/queries/useGetEntity';

interface UseGetAuditReportParams {
  id: string;
  filter?: FilterType;
  refetchInterval?: number | false | ((data?: AuditReport) => number | false);
}

interface UseGetAuditReportHostsParams {
  reportId: string;
  filter?: FilterType;
  refetchInterval?: number | false;
}

export const useGetAuditReport = ({
  id,
  filter = undefined,
  refetchInterval = undefined,
}: UseGetAuditReportParams) => {
  const gmp = useGmp();
  const filterString = filter?.toFilterString();

  return useGetEntity<AuditReport>({
    gmpMethod: async ({id: auditReportId}) => {
      return gmp.auditreport.get({id: auditReportId}, {filter, details: false});
    },
    queryId: 'get_audit_report',
    queryKeyParts: [filterString],
    id,
    refetchInterval,
  });
};

export const useGetAuditReportHosts = ({
  reportId,
  filter = undefined,
  refetchInterval = undefined,
}: UseGetAuditReportHostsParams) => {
  const gmp = useGmp();

  return useGetEntities<ReportHost>({
    gmpMethod: ({filter: reportFilter}) =>
      gmp.auditreport.getHosts({
        report_id: reportId,
        filter: reportFilter,
      }),
    queryId: `get_audit_report_hosts_${reportId}`,
    filter,
    refetchInterval,
    enabled: Boolean(reportId),
    keepPreviousData: true,
  });
};

export default useGetAuditReport;

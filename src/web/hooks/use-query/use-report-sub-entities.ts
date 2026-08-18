/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {type FilterType} from 'gmp/models/filter';
import {useGetReportApplications} from 'web/hooks/use-query/report-applications';
import {useGetReportClosedCves} from 'web/hooks/use-query/report-closed-cves';
import {useGetReportCves} from 'web/hooks/use-query/report-cves';
import {useGetReportErrors} from 'web/hooks/use-query/report-errors';
import {useGetReportHosts} from 'web/hooks/use-query/report-hosts';
import {useGetReportOperatingSystems} from 'web/hooks/use-query/report-operating-system';
import {useGetReportPorts} from 'web/hooks/use-query/report-ports';
import {useGetReportTlsCertificates} from 'web/hooks/use-query/report-tls-certificates';

export interface ReportSubEntities {
  hosts: ReturnType<typeof useGetReportHosts>;
  ports: ReturnType<typeof useGetReportPorts>;
  applications: ReturnType<typeof useGetReportApplications>;
  operatingSystems: ReturnType<typeof useGetReportOperatingSystems>;
  cves: ReturnType<typeof useGetReportCves>;
  closedCves: ReturnType<typeof useGetReportClosedCves>;
  tlsCertificates: ReturnType<typeof useGetReportTlsCertificates>;
  errors: ReturnType<typeof useGetReportErrors>;
}

interface UseReportSubEntitiesParams {
  reportId: string;
  filter?: FilterType;
  refetchInterval?: number | false;
  staleTime?: number;
}

const useReportSubEntities = ({
  reportId,
  filter = undefined,
  refetchInterval = undefined,
  staleTime,
}: UseReportSubEntitiesParams): ReportSubEntities => ({
  hosts: useGetReportHosts({reportId, filter, refetchInterval, staleTime}),
  ports: useGetReportPorts({reportId, filter, refetchInterval, staleTime}),
  applications: useGetReportApplications({
    reportId,
    filter,
    refetchInterval,
    staleTime,
  }),
  operatingSystems: useGetReportOperatingSystems({
    reportId,
    filter,
    refetchInterval,
    staleTime,
  }),
  cves: useGetReportCves({reportId, filter, refetchInterval, staleTime}),
  closedCves: useGetReportClosedCves({
    reportId,
    filter,
    refetchInterval,
    staleTime,
  }),
  tlsCertificates: useGetReportTlsCertificates({
    reportId,
    filter,
    refetchInterval,
    staleTime,
  }),
  errors: useGetReportErrors({reportId, filter, refetchInterval, staleTime}),
});

export default useReportSubEntities;

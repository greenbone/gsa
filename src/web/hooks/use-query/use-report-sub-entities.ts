/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type Filter from 'gmp/models/filter';
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
  filter?: Filter;
  refetchInterval?: number | false;
}

const useReportSubEntities = ({
  reportId,
  filter = undefined,
  refetchInterval = undefined,
}: UseReportSubEntitiesParams): ReportSubEntities => ({
  hosts: useGetReportHosts({reportId, filter, refetchInterval}),
  ports: useGetReportPorts({reportId, filter, refetchInterval}),
  applications: useGetReportApplications({reportId, filter, refetchInterval}),
  operatingSystems: useGetReportOperatingSystems({
    reportId,
    filter,
    refetchInterval,
  }),
  cves: useGetReportCves({reportId, filter, refetchInterval}),
  closedCves: useGetReportClosedCves({reportId, filter, refetchInterval}),
  tlsCertificates: useGetReportTlsCertificates({
    reportId,
    filter,
    refetchInterval,
  }),
  errors: useGetReportErrors({reportId, filter, refetchInterval}),
});

export default useReportSubEntities;

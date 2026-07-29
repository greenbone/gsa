/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {type FilterType} from 'gmp/models/filter';
import {useGetAuditReportHosts} from 'web/hooks/use-query/audit-report';
import {useGetReportErrors} from 'web/hooks/use-query/report-errors';
import {useGetReportOperatingSystems} from 'web/hooks/use-query/report-operating-system';
import {useGetReportTlsCertificates} from 'web/hooks/use-query/report-tls-certificates';

export interface AuditReportSubEntities {
  hosts: ReturnType<typeof useGetAuditReportHosts>;
  operatingSystems: ReturnType<typeof useGetReportOperatingSystems>;
  tlsCertificates: ReturnType<typeof useGetReportTlsCertificates>;
  errors: ReturnType<typeof useGetReportErrors>;
}

interface UseAuditReportSubEntitiesParams {
  reportId: string;
  filter?: FilterType;
  refetchInterval?: number | false;
}

const useAuditReportSubEntities = ({
  reportId,
  filter = undefined,
  refetchInterval = undefined,
}: UseAuditReportSubEntitiesParams): AuditReportSubEntities => ({
  hosts: useGetAuditReportHosts({reportId, filter, refetchInterval}),
  operatingSystems: useGetReportOperatingSystems({
    reportId,
    filter,
    refetchInterval,
  }),
  tlsCertificates: useGetReportTlsCertificates({
    reportId,
    filter,
    refetchInterval,
  }),
  errors: useGetReportErrors({reportId, filter, refetchInterval}),
});

export default useAuditReportSubEntities;

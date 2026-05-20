/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type Filter from 'gmp/models/filter';
import type ReportTLSCertificate from 'gmp/models/report/tls-certificate';
import useGmp from 'web/hooks/useGmp';
import useGetEntities from 'web/queries/useGetEntities';

interface UseGetReportTlsCertificatesParams {
  reportId: string;
  filter?: Filter;
  refetchInterval?: number | false;
}

export const useGetReportTlsCertificates = ({
  reportId,
  filter = undefined,
  refetchInterval = undefined,
}: UseGetReportTlsCertificatesParams) => {
  const gmp = useGmp();

  return useGetEntities<ReportTLSCertificate>({
    gmpMethod: ({filter: reportFilter}) =>
      gmp.reporttlscertificates.get({
        report_id: reportId,
        filter: reportFilter,
      }),
    queryId: `get_report_tls_certificates_${reportId}`,
    filter,
    enabled: Boolean(reportId),
    keepPreviousData: true,
    refetchInterval,
  });
};

export default useGetReportTlsCertificates;

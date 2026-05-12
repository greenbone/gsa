/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type CollectionCounts from 'gmp/collection/collection-counts';
import type Filter from 'gmp/models/filter';
import type ReportTLSCertificate from 'gmp/models/report/tls-certificate';
import ReportEntitiesContainer from 'web/pages/reports/details/ReportEntitiesContainer';
import TLSCertificatesTable from 'web/pages/reports/details/TlsCertificatesTable';
import {
  makeCompareDate,
  makeCompareIp,
  makeComparePort,
  makeCompareString,
} from 'web/utils/Sort';

interface TLSCertificatesTabProps {
  counts?: CollectionCounts;
  filter: Filter;
  isUpdating?: boolean;
  sortField: string;
  sortReverse: boolean;
  tlsCertificates?: ReportTLSCertificate[];
  onSortChange: (sortBy: string) => void;
  onTlsCertificateDownloadClick: (entity: ReportTLSCertificate) => void;
}

const tlsCertificatesSortFunctions = {
  dn: makeCompareString('subjectDn'),
  serial: makeCompareString('serial'),
  notvalidbefore: makeCompareDate('activationTime'),
  notvalidafter: makeCompareDate('expirationTime'),
  ip: makeCompareIp('ip'),
  hostname: makeCompareString('hostname'),
  port: makeComparePort('port'),
};

const TLSCertificatesTab = ({
  counts,
  filter,
  isUpdating,
  sortField,
  sortReverse,
  tlsCertificates,

  onSortChange,
  onTlsCertificateDownloadClick,
}: TLSCertificatesTabProps) => (
  <ReportEntitiesContainer<ReportTLSCertificate>
    counts={counts}
    entities={tlsCertificates}
    filter={filter}
    sortField={sortField}
    sortFunctions={tlsCertificatesSortFunctions}
    sortReverse={sortReverse}
  >
    {({
      entities,
      entitiesCounts,
      sortBy,
      sortDir,
      onFirstClick,
      onLastClick,
      onNextClick,
      onPreviousClick,
    }) => (
      <TLSCertificatesTable
        // @ts-expect-error entities are ReportTLSCertificate[], not Model[]
        entities={entities}
        entitiesCounts={entitiesCounts}
        filter={filter}
        isUpdating={isUpdating}
        sortBy={sortBy}
        sortDir={sortDir}
        toggleDetailsIcon={false}
        onFirstClick={onFirstClick}
        onLastClick={onLastClick}
        onNextClick={onNextClick}
        onPreviousClick={onPreviousClick}
        onSortChange={onSortChange}
        onTlsCertificateDownloadClick={onTlsCertificateDownloadClick}
      />
    )}
  </ReportEntitiesContainer>
);

export default TLSCertificatesTab;

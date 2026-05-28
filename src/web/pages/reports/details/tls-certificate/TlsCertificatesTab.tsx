/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useEffect, useMemo, useState} from 'react';
import Filter from 'gmp/models/filter';
import type ReportTLSCertificate from 'gmp/models/report/tls-certificate';
import {isActive, type TaskStatus} from 'gmp/models/task';
import ErrorPanel from 'web/components/error/ErrorPanel';
import Loading from 'web/components/loading/Loading';
import {
  NO_RELOAD,
  USE_DEFAULT_RELOAD_INTERVAL_ACTIVE,
} from 'web/components/loading/Reload';
import useGetReportTlsCertificates from 'web/hooks/use-query/report-tls-certificates';
import useFilterSortBy from 'web/hooks/useFilterSortBy';
import useTranslation from 'web/hooks/useTranslation';
import ReportEntitiesContainer from 'web/pages/reports/details/ReportEntitiesContainer';
import TLSCertificatesTable from 'web/pages/reports/details/tls-certificate/TlsCertificatesTable';
import {
  makeCompareDate,
  makeCompareIp,
  makeComparePort,
  makeCompareString,
} from 'web/utils/Sort';

export const tlsCertificatesSortFunctions = {
  dn: makeCompareString('subjectDn'),
  serial: makeCompareString('serial'),
  notvalidbefore: makeCompareDate('activationTime'),
  notvalidafter: makeCompareDate('expirationTime'),
  ip: makeCompareIp('ip'),
  hostname: makeCompareString('hostname'),
  port: makeComparePort('port'),
};

interface TLSCertificatesTabProps {
  reportId: string;
  reportFilter: Filter;
  status: TaskStatus;
  onTlsCertificateDownloadClick: (entity: ReportTLSCertificate) => void;
}

const TLSCertificatesTab = ({
  reportId,
  reportFilter,
  status,
  onTlsCertificateDownloadClick,
}: TLSCertificatesTabProps) => {
  const [_] = useTranslation();
  const reportFilterString = reportFilter.toFilterString();

  const baseFilter = useMemo(() => {
    const f = Filter.fromString(reportFilterString);
    // Override sort: 'sort-reverse=dn' maps to ascending A→Z via the
    // sortReverse=(sortDir==='asc') convention used in ReportEntitiesContainer
    f.set('sort-reverse', 'dn');
    return f;
  }, [reportFilterString]);

  const [tlsCertificatesFilter, setTlsCertificatesFilter] =
    useState<Filter>(baseFilter);

  useEffect(() => {
    setTlsCertificatesFilter(baseFilter);
  }, [baseFilter]);

  const {data, isLoading, isFetching, isError, error} =
    useGetReportTlsCertificates({
      reportId,
      filter: tlsCertificatesFilter,
      refetchInterval: isActive(status)
        ? USE_DEFAULT_RELOAD_INTERVAL_ACTIVE
        : NO_RELOAD,
    });

  const updateFilter = (newFilter: Filter) => {
    setTlsCertificatesFilter(newFilter);
  };

  const [sortBy, sortDir, handleSortChange] = useFilterSortBy(
    tlsCertificatesFilter,
    updateFilter,
  );

  if (isError) {
    return (
      <ErrorPanel
        error={error}
        message={_(
          'Error while loading TLS Certificates for Report {{reportId}}',
          {
            reportId,
          },
        )}
      />
    );
  }

  if (isLoading && !data) {
    return <Loading />;
  }

  const {
    entities: tlsCertificates = [],
    entitiesCounts: tlsCertificatesCounts,
  } = data || {};

  return (
    <ReportEntitiesContainer
      counts={tlsCertificatesCounts}
      entities={tlsCertificates}
      filter={tlsCertificatesFilter}
      sortField={sortBy || 'dn'}
      sortFunctions={tlsCertificatesSortFunctions}
      sortReverse={sortDir === 'asc'}
    >
      {({
        entities,
        entitiesCounts,
        sortBy: sortByPaged,
        sortDir: sortDirPaged,
        onFirstClick,
        onLastClick,
        onNextClick,
        onPreviousClick,
      }) => (
        <TLSCertificatesTable
          // @ts-expect-error entities are ReportTLSCertificate[], not Model[]
          entities={entities}
          entitiesCounts={entitiesCounts}
          filter={tlsCertificatesFilter}
          isUpdating={isFetching}
          sortBy={sortByPaged || 'dn'}
          sortDir={sortDirPaged}
          toggleDetailsIcon={false}
          onFirstClick={onFirstClick}
          onLastClick={onLastClick}
          onNextClick={onNextClick}
          onPreviousClick={onPreviousClick}
          onSortChange={handleSortChange}
          onTlsCertificateDownloadClick={onTlsCertificateDownloadClick}
        />
      )}
    </ReportEntitiesContainer>
  );
};

export default TLSCertificatesTab;

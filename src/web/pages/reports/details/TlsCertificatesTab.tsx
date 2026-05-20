/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useEffect, useMemo, useState} from 'react';
import CollectionCounts from 'gmp/collection/collection-counts';
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
import usePagination from 'web/hooks/usePagination';
import useTranslation from 'web/hooks/useTranslation';
import TLSCertificatesTable from 'web/pages/reports/details/TlsCertificatesTable';

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
    return Filter.fromString(reportFilterString);
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

  const [
    handleFirstClick,
    handleLastClick,
    handleNextClick,
    handlePreviousClick,
  ] = usePagination(
    tlsCertificatesFilter,
    data?.entitiesCounts ?? new CollectionCounts(),
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
    <TLSCertificatesTable
      // @ts-expect-error entities are ReportTLSCertificate[], not Model[]
      entities={tlsCertificates}
      entitiesCounts={tlsCertificatesCounts}
      filter={tlsCertificatesFilter}
      isUpdating={isFetching && !data}
      sortBy={sortBy || 'severity'}
      sortDir={sortDir}
      toggleDetailsIcon={false}
      onFirstClick={handleFirstClick}
      onLastClick={handleLastClick}
      onNextClick={handleNextClick}
      onPreviousClick={handlePreviousClick}
      onSortChange={handleSortChange}
      onTlsCertificateDownloadClick={onTlsCertificateDownloadClick}
    />
  );
};

export default TLSCertificatesTab;

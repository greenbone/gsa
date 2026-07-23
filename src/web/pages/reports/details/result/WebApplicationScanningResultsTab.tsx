/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useCallback, useEffect, useMemo, useState} from 'react';
import CollectionCounts from 'gmp/collection/collection-counts';
import type FilterType from 'gmp/models/filter/filter-type';
import QueryFilter from 'gmp/models/filter/query-filter';
import {isActive, type TaskStatus} from 'gmp/models/task';
import ErrorPanel from 'web/components/error/ErrorPanel';
import Loading from 'web/components/loading/Loading';
import {
  NO_RELOAD,
  USE_DEFAULT_RELOAD_INTERVAL_ACTIVE,
} from 'web/components/loading/Reload';
import useGetResults from 'web/hooks/use-query/results';
import useFilterSortBy from 'web/hooks/useFilterSortBy';
import usePagination from 'web/hooks/usePagination';
import useTranslation from 'web/hooks/useTranslation';
import WebApplicationScanningResultsTable from 'web/pages/reports/details/result/WebApplicationScanningResultsTable';

interface WebApplicationScanningResultsTabProps {
  reportId: string;
  reportFilter: FilterType;
  status: TaskStatus;
}

const WebApplicationScanningResultsTab = ({
  reportId,
  reportFilter,
  status,
}: WebApplicationScanningResultsTabProps) => {
  const [_] = useTranslation();
  const reportFilterString = reportFilter.toFilterString();

  const baseFilter = useMemo(() => {
    const filter = reportFilterString
      ? QueryFilter.fromString(reportFilterString)
      : new QueryFilter();
    return filter.set('_and_report_id', reportId);
  }, [reportFilterString, reportId]);

  const [resultsFilter, setResultsFilter] = useState<FilterType>(baseFilter);

  useEffect(() => {
    setResultsFilter(baseFilter);
  }, [baseFilter]);

  const {data, isLoading, isFetching, isError, error} = useGetResults({
    filter: resultsFilter,
    refetchInterval: isActive(status)
      ? USE_DEFAULT_RELOAD_INTERVAL_ACTIVE
      : NO_RELOAD,
  });

  const updateFilter = useCallback(
    (newFilter: FilterType) => {
      setResultsFilter(newFilter.set('_and_report_id', reportId));
    },
    [reportId],
  );

  const [sortBy, sortDir, handleSortChange] = useFilterSortBy(
    resultsFilter,
    updateFilter,
  );

  const [
    handleFirstClick,
    handleLastClick,
    handleNextClick,
    handlePreviousClick,
  ] = usePagination(
    resultsFilter,
    data?.entitiesCounts ?? new CollectionCounts(),
    updateFilter,
  );

  if (isError) {
    return (
      <ErrorPanel
        error={error}
        message={_(
          'Error while loading Web Application Scanning Results for Report {{reportId}}',
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

  if (!data) {
    return null;
  }

  const {entities = [], entitiesCounts} = data;

  return (
    <WebApplicationScanningResultsTable
      entities={entities}
      entitiesCounts={entitiesCounts}
      filter={resultsFilter}
      isUpdating={isFetching && !data}
      sortBy={sortBy}
      sortDir={sortDir}
      onFirstClick={handleFirstClick}
      onLastClick={handleLastClick}
      onNextClick={handleNextClick}
      onPreviousClick={handlePreviousClick}
      onSortChange={handleSortChange}
    />
  );
};

export default WebApplicationScanningResultsTab;

/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useCallback, useEffect, useMemo, useState} from 'react';
import CollectionCounts from 'gmp/collection/collection-counts';
import Filter from 'gmp/models/filter';
import {isDefined} from 'gmp/utils/identity';
import ErrorPanel from 'web/components/error/ErrorPanel';
import Loading from 'web/components/loading/Loading';
import useGetResults from 'web/hooks/use-query/results';
import useFilterSortBy from 'web/hooks/useFilterSortBy';
import usePagination from 'web/hooks/usePagination';
import useTranslation from 'web/hooks/useTranslation';
import ContainerScanningResultsTable from 'web/pages/reports/details/ContainerScanningResultsTable';

interface ContainerScanningResultsTabProps {
  reportId: string;
  reportFilter: Filter;
}

const ContainerScanningResultsTab = ({
  reportId,
  reportFilter,
}: ContainerScanningResultsTabProps) => {
  const [_] = useTranslation();

  const baseFilter = useMemo(() => {
    const filter = isDefined(reportFilter) ? reportFilter.copy() : new Filter();
    return filter.set('_and_report_id', reportId);
  }, [reportFilter, reportId]);

  const [resultsFilter, setResultsFilter] = useState<Filter>(baseFilter);

  useEffect(() => {
    setResultsFilter(baseFilter);
  }, [baseFilter]);

  const {data, isLoading, isFetching, isError, error} = useGetResults({
    filter: resultsFilter,
  });

  const updateFilter = useCallback(
    (newFilter: Filter) => {
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

  if (isLoading && !data) {
    return <Loading />;
  }

  if (isError) {
    return (
      <ErrorPanel
        error={error}
        message={_(
          'Error while loading Container Scanning Results for Report {{reportId}}',
          {
            reportId,
          },
        )}
      />
    );
  }

  if (!data) {
    return null;
  }

  const {entities = [], entitiesCounts} = data;

  return (
    <ContainerScanningResultsTable
      entities={entities}
      entitiesCounts={entitiesCounts}
      filter={resultsFilter}
      isUpdating={isFetching}
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

export default ContainerScanningResultsTab;

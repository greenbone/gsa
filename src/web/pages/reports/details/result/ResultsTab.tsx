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
import EmptyReport from 'web/pages/reports/details/EmptyReport';
import EmptyResultsReport from 'web/pages/reports/details/EmptyResultsReport';
import ResultsTable from 'web/pages/results/ResultsTable';

interface ResultsCounts {
  filtered?: number;
  full?: number;
}

interface ResultsTabWrapperProps {
  audit?: boolean;
  hasTarget: boolean;
  progress: number;
  reportFilter: FilterType;
  reportId: string;
  reportResultsCounts?: ResultsCounts;
  status: TaskStatus;
  onFilterAddLogLevelClick?: () => void;
  onFilterDecreaseMinQoDClick: () => void;
  onFilterEditClick: () => void;
  onFilterRemoveClick: () => void;
  onFilterRemoveSeverityClick?: () => void;
  onTargetEditClick: () => void;
}

const ResultsTabWrapper = ({
  audit = false,
  hasTarget,
  progress,
  reportFilter,
  reportId,
  reportResultsCounts,
  status,
  onFilterAddLogLevelClick,
  onFilterDecreaseMinQoDClick,
  onFilterEditClick,
  onFilterRemoveClick,
  onFilterRemoveSeverityClick,
  onTargetEditClick,
}: ResultsTabWrapperProps) => {
  const [_] = useTranslation();
  const reportFilterString = reportFilter.toFilterString();

  // Create filter with report ID
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
        message={_('Error while loading Results for Report {{reportId}}', {
          reportId,
        })}
      />
    );
  }

  if (isLoading && !data) {
    return <Loading />;
  }

  const {entities: results = [], entitiesCounts: resultsCounts} = data || {};

  const displayedFilter = resultsFilter.delete('_and_report_id');

  if (reportResultsCounts?.filtered === 0) {
    if ((reportResultsCounts.full ?? 0) === 0) {
      return (
        <EmptyReport
          hasTarget={hasTarget}
          progress={progress}
          status={status}
          onTargetEditClick={onTargetEditClick}
        />
      );
    } else if ((reportResultsCounts.full ?? 0) > 0) {
      return (
        <EmptyResultsReport
          all={reportResultsCounts.full ?? 0}
          filter={displayedFilter}
          onFilterAddLogLevelClick={onFilterAddLogLevelClick}
          onFilterDecreaseMinQoDClick={onFilterDecreaseMinQoDClick}
          onFilterEditClick={onFilterEditClick}
          onFilterRemoveClick={onFilterRemoveClick}
          onFilterRemoveSeverityClick={onFilterRemoveSeverityClick}
        />
      );
    }
  }

  return (
    <ResultsTable
      audit={audit}
      delta={false}
      entities={results}
      entitiesCounts={resultsCounts}
      filter={displayedFilter}
      footer={false}
      isUpdating={isFetching}
      links={true}
      sortBy={sortBy || 'severity'}
      sortDir={sortDir}
      toggleDetailsIcon={false}
      onFirstClick={handleFirstClick}
      onLastClick={handleLastClick}
      onNextClick={handleNextClick}
      onPreviousClick={handlePreviousClick}
      onSortChange={handleSortChange}
    />
  );
};

export default ResultsTabWrapper;

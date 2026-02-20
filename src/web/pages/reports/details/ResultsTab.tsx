/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useCallback, useEffect, useMemo, useState} from 'react';
import CollectionCounts from 'gmp/collection/collection-counts';
import Filter from 'gmp/models/filter';
import type {TaskStatus} from 'gmp/models/task';
import {isDefined} from 'gmp/utils/identity';
import ErrorPanel from 'web/components/error/ErrorPanel';
import Loading from 'web/components/loading/Loading';
import useGetResults from 'web/hooks/use-query/results';
import useFilterSortBy from 'web/hooks/useFilterSortBy';
import usePagination from 'web/hooks/usePagination';
import useTranslation from 'web/hooks/useTranslation';
import EmptyReport from 'web/pages/reports/details/EmptyReport';
import EmptyResultsReport from 'web/pages/reports/details/EmptyResultsReport';
import ResultsTable from 'web/pages/results/ResultsTable';

interface ResultsTabWrapperProps {
  audit?: boolean;
  hasTarget: boolean;
  progress: number;
  reportFilter: Filter;
  reportId: string;
  reportResultsCounts?: CollectionCounts;
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

  // Create filter with report ID
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

  const displayedFilter = resultsFilter.copy().delete('_and_report_id');

  if (reportResultsCounts?.filtered === 0) {
    if (reportResultsCounts.all === 0) {
      return (
        <EmptyReport
          hasTarget={hasTarget}
          progress={progress}
          status={status}
          onTargetEditClick={onTargetEditClick}
        />
      );
    } else if (reportResultsCounts.all > 0) {
      return (
        <EmptyResultsReport
          all={reportResultsCounts.all}
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

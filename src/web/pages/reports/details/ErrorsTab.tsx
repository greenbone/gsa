/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useCallback, useMemo, useState} from 'react';
import {useTranslation} from 'react-i18next';
import type CollectionCounts from 'gmp/collection/collection-counts';
import Filter from 'gmp/models/filter';
import type {ReportError} from 'gmp/models/report/parser';
import {isDefined} from 'gmp/utils/identity';
import ErrorPanel from 'web/components/error/ErrorPanel';
import Loading from 'web/components/loading/Loading';
import useGetReportErrors from 'web/hooks/use-query/report-errors';
import useFilterSortBy from 'web/hooks/useFilterSortBy';
import ErrorsTable from 'web/pages/reports/details/ErrorsTable';
import ReportEntitiesContainer from 'web/pages/reports/details/ReportEntitiesContainer';
import {makeCompareIp, makeCompareString} from 'web/utils/Sort';

interface ErrorsTabWrapperProps {
  filter?: Filter;
  reportId: string;
  reportErrors?: ReportError[];
  reportErrorsCounts?: CollectionCounts;
  onSortChange?: (sortField: string) => void;
  onFilterAddLogLevelClick?: () => void;
  onFilterDecreaseMinQoDClick?: () => void;
  onFilterEditClick?: () => void;
  onFilterRemoveClick?: () => void;
  onFilterRemoveSeverityClick?: () => void;
}

export const errorsSortFunctions = {
  error: makeCompareString('description'),
  host: makeCompareIp(entity => entity.host.ip),
  hostname: makeCompareString(entity => entity.host.name),
  nvt: makeCompareString(entity => entity.nvt.name),
  port: makeCompareString('port'),
};

const ErrorsTabWrapper = ({
  filter,
  reportId,
  reportErrors,
  reportErrorsCounts,
  onSortChange,
  onFilterAddLogLevelClick,
  onFilterDecreaseMinQoDClick,
  onFilterEditClick,
  onFilterRemoveClick,
  onFilterRemoveSeverityClick,
}: ErrorsTabWrapperProps) => {
  const {t: _} = useTranslation();

  const baseFilter = useMemo(() => {
    return isDefined(filter) ? filter.copy() : new Filter();
  }, [filter]);

  const [errorsFilter, setErrorsFilter] = useState<Filter>(baseFilter);

  const {data, isLoading, isFetching, isError, error} = useGetReportErrors({
    reportId,
    filter: errorsFilter,
  });

  const updateFilter = useCallback((newFilter: Filter) => {
    setErrorsFilter(newFilter);
  }, []);

  const [sortBy, sortDir, handleSortChange] = useFilterSortBy(
    errorsFilter,
    updateFilter,
  );

  const handleSort = useCallback(
    (newSortBy: string) => {
      handleSortChange(newSortBy);
      onSortChange?.(newSortBy);
    },
    [handleSortChange, onSortChange],
  );

  if (isError) {
    return (
      <ErrorPanel
        error={error}
        message={_('Error while loading Errors for Report {{reportId}}', {
          reportId,
        })}
      />
    );
  }

  const errors = data?.entities ?? reportErrors ?? [];
  const errorsCounts = data?.entitiesCounts;

  const displayedFilter = errorsFilter;
  const finalCounts = errorsCounts || reportErrorsCounts;

  if (isLoading && !data) {
    return <Loading />;
  }

  return (
    <ReportEntitiesContainer
      counts={finalCounts}
      entities={errors}
      filter={displayedFilter}
      sortField={sortBy || 'error'}
      sortFunctions={errorsSortFunctions}
      sortReverse={sortDir === 'asc'}
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
        <ErrorsTable
          // @ts-expect-error entities are ReportErrors[], not Model[]
          entities={entities}
          entitiesCounts={entitiesCounts}
          filter={displayedFilter}
          isUpdating={isFetching}
          sortBy={sortBy}
          sortDir={sortDir}
          toggleDetailsIcon={false}
          onFirstClick={onFirstClick}
          onLastClick={onLastClick}
          onNextClick={onNextClick}
          onPreviousClick={onPreviousClick}
          onSortChange={handleSort}
        />
      )}
    </ReportEntitiesContainer>
  );
};

export default ErrorsTabWrapper;

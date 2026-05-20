/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useMemo, useState} from 'react';
import {useTranslation} from 'react-i18next';
import Filter from 'gmp/models/filter';
import {isActive, type TaskStatus} from 'gmp/models/task';
import {isDefined} from 'gmp/utils/identity';
import ErrorPanel from 'web/components/error/ErrorPanel';
import Loading from 'web/components/loading/Loading';
import {
  NO_RELOAD,
  USE_DEFAULT_RELOAD_INTERVAL_ACTIVE,
} from 'web/components/loading/Reload';
import useGetReportErrors from 'web/hooks/use-query/report-errors';
import useFilterSortBy from 'web/hooks/useFilterSortBy';
import ErrorsTable from 'web/pages/reports/details/ErrorsTable';
import ReportEntitiesContainer from 'web/pages/reports/details/ReportEntitiesContainer';
import {makeCompareIp, makeCompareString} from 'web/utils/Sort';

interface ErrorsTabWrapperProps {
  filter?: Filter;
  reportId: string;
  status: TaskStatus;
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
  status,
}: ErrorsTabWrapperProps) => {
  const [_] = useTranslation();

  const baseFilter = useMemo(() => {
    return isDefined(filter) ? filter.copy() : new Filter();
  }, [filter]);

  const [errorsFilter, setErrorsFilter] = useState<Filter>(baseFilter);

  const {data, isLoading, isFetching, isError, error} = useGetReportErrors({
    reportId,
    filter: errorsFilter,
    refetchInterval: isActive(status)
      ? USE_DEFAULT_RELOAD_INTERVAL_ACTIVE
      : NO_RELOAD,
  });

  const updateFilter = (newFilter: Filter) => {
    setErrorsFilter(newFilter);
  };

  const [sortBy, sortDir, handleSortChange] = useFilterSortBy(
    errorsFilter,
    updateFilter,
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

  const {entities: errors = [], entitiesCounts: errorsCounts} = data || {};

  const displayedFilter = errorsFilter;

  if (isLoading && !data) {
    return <Loading />;
  }

  return (
    <ReportEntitiesContainer
      counts={errorsCounts}
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
          onSortChange={handleSortChange}
        />
      )}
    </ReportEntitiesContainer>
  );
};

export default ErrorsTabWrapper;

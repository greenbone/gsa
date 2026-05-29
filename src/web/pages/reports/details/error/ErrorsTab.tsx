/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useEffect, useMemo, useState} from 'react';
import Filter from 'gmp/models/filter';
import {type ReportError} from 'gmp/models/report/parser';
import {isDefined} from 'gmp/utils/identity';
import ErrorPanel from 'web/components/error/ErrorPanel';
import Loading from 'web/components/loading/Loading';
import useFilterSortBy from 'web/hooks/useFilterSortBy';
import useTranslation from 'web/hooks/useTranslation';
import ErrorsTable from 'web/pages/reports/details/error/ErrorsTable';
import ReportEntitiesContainer from 'web/pages/reports/details/ReportEntitiesContainer';
import {type UseGetEntitiesReturn} from 'web/queries/useGetEntities';
import {makeCompareIp, makeCompareString} from 'web/utils/Sort';

interface ErrorsTabWrapperProps {
  filter?: Filter;
  reportId: string;
  errorsData?: UseGetEntitiesReturn<ReportError>;
  isErrorsFetching?: boolean;
  isErrorsError?: boolean;
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
  isErrorsError,
  errorsData,
  isErrorsFetching,
}: ErrorsTabWrapperProps) => {
  const [_] = useTranslation();

  const baseFilter = useMemo(() => {
    const f = isDefined(filter) ? filter.copy() : new Filter();
    // Override sort: 'sort-reverse=error' maps to ascending A→Z via the
    // sortReverse=(sortDir==='asc') convention used in ReportEntitiesContainer
    f.set('sort-reverse', 'error');
    return f;
  }, [filter]);

  const [errorsFilter, setErrorsFilter] = useState<Filter>(baseFilter);

  useEffect(() => {
    setErrorsFilter(baseFilter);
  }, [baseFilter]);

  const data = errorsData;
  const isFetching = isErrorsFetching ?? false;
  const isLoading = !data && isFetching;
  const isError = isErrorsError ?? false;
  const updateFilter = (newFilter: Filter) => {
    setErrorsFilter(newFilter);
  };

  const [sortBy, sortDir, handleSortChange] = useFilterSortBy(
    errorsFilter,
    updateFilter,
  );

  const {entities: errors = [], entitiesCounts: errorsCounts} = data || {};

  const displayedFilter = errorsFilter;

  if (isLoading && !data) {
    return <Loading />;
  }

  if (isError) {
    return (
      <ErrorPanel
        message={_(
          'Error while loading Error Messages for Report {{reportId}}',
          {
            reportId,
          },
        )}
      />
    );
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
          // @ts-expect-error entities are ReportError[], not Model[]
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

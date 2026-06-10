/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useEffect, useMemo, useState} from 'react';
import {useTranslation} from 'react-i18next';
import Filter from 'gmp/models/filter';
import {type ReportClosedCve} from 'gmp/models/report/parser';
import {isDefined} from 'gmp/utils/identity';
import ErrorPanel from 'web/components/error/ErrorPanel';
import Loading from 'web/components/loading/Loading';
import useFilterSortBy from 'web/hooks/useFilterSortBy';
import ClosedCvesTable from 'web/pages/reports/details/cve/ClosedCvesTable';
import ReportEntitiesContainer from 'web/pages/reports/details/ReportEntitiesContainer';
import {type UseGetEntitiesReturn} from 'web/queries/useGetEntities';
import {
  makeCompareIp,
  makeCompareSeverity,
  makeCompareString,
} from 'web/utils/Sort';

interface ClosedCvesTabProps {
  filter?: Filter;
  reportId: string;
  closedCvesData?: UseGetEntitiesReturn<ReportClosedCve>;
  isClosedCvesFetching?: boolean;
  isClosedCvesError?: boolean;
}

export const closedCvesSortFunctions = {
  cve: makeCompareString('cveId'),
  host: makeCompareIp(entity => entity.host.ip),
  nvt: makeCompareString(entity => entity.source?.description),
  severity: makeCompareSeverity(),
};

const ClosedCvesTabWrapper = ({
  filter,
  reportId,
  isClosedCvesError,
  closedCvesData,
  isClosedCvesFetching,
}: ClosedCvesTabProps) => {
  const [_] = useTranslation();

  const baseFilter = useMemo(() => {
    return isDefined(filter) ? filter.copy() : new Filter();
  }, [filter]);

  const [closedCvesFilter, setClosedCvesFilter] = useState<Filter>(baseFilter);

  useEffect(() => {
    setClosedCvesFilter(baseFilter);
  }, [baseFilter]);

  const data = closedCvesData;
  const isFetching = isClosedCvesFetching ?? false;
  const isLoading = !data && isFetching;
  const isError = isClosedCvesError ?? false;
  const updateFilter = (newFilter: Filter) => {
    setClosedCvesFilter(newFilter);
  };

  const [sortBy, sortDir, handleSortChange] = useFilterSortBy(
    closedCvesFilter,
    updateFilter,
  );

  const {entities: closedCves = [], entitiesCounts: closedCvesCounts} =
    data || {};

  const displayedFilter = closedCvesFilter;

  if (isLoading && !data) {
    return <Loading />;
  }

  if (isError) {
    return (
      <ErrorPanel
        message={_('Error while loading Closed CVEs for Report {{reportId}}', {
          reportId,
        })}
      />
    );
  }

  return (
    <ReportEntitiesContainer
      counts={closedCvesCounts}
      entities={closedCves}
      filter={displayedFilter}
      sortField={sortBy || 'severity'}
      sortFunctions={closedCvesSortFunctions}
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
        <ClosedCvesTable
          // @ts-expect-error entities are ReportActiveCve[], not Model[]
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

export default ClosedCvesTabWrapper;

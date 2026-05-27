/* SPDX-FileCopyrightText: 2024 Greenbone AG
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
import useGetReportClosedCves from 'web/hooks/use-query/report-closed-cves';
import useFilterSortBy from 'web/hooks/useFilterSortBy';
import ClosedCvesTable from 'web/pages/reports/details/ClosedCvesTable';
import ReportEntitiesContainer from 'web/pages/reports/details/ReportEntitiesContainer';
import {
  makeCompareIp,
  makeCompareString,
  makeCompareSeverity,
} from 'web/utils/Sort';

interface ClosedCvesTabProps {
  filter?: Filter;
  reportId: string;
  status: TaskStatus;
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
  status,
}: ClosedCvesTabProps) => {
  const [_] = useTranslation();

  const baseFilter = useMemo(() => {
    return isDefined(filter) ? filter.copy() : new Filter();
  }, [filter]);

  const [closedCvesFilter, setClosedCvesFilter] = useState<Filter>(baseFilter);

  const {data, isLoading, isFetching, isError, error} = useGetReportClosedCves({
    reportId,
    filter: closedCvesFilter,
    refetchInterval: isActive(status)
      ? USE_DEFAULT_RELOAD_INTERVAL_ACTIVE
      : NO_RELOAD,
  });

  const updateFilter = (newFilter: Filter) => {
    setClosedCvesFilter(newFilter);
  };

  const [sortBy, sortDir, handleSortChange] = useFilterSortBy(
    closedCvesFilter,
    updateFilter,
  );

  if (isError) {
    return (
      <ErrorPanel
        error={error}
        message={_('Error while loading Closed CVEs for Report {{reportId}}', {
          reportId,
        })}
      />
    );
  }

  const {entities: closedCves = [], entitiesCounts: closedCvesCounts} =
    data || {};

  const displayedFilter = closedCvesFilter;

  if (isLoading && !data) {
    return <Loading />;
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
          // @ts-expect-error entities are ReportClosedCve[], not Model[]
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

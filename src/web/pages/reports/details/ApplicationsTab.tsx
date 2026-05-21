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
import useGetReportApplications from 'web/hooks/use-query/report-applications';
import useFilterSortBy from 'web/hooks/useFilterSortBy';
import ApplicationsTable from 'web/pages/reports/details/ApplicationsTable';
import ReportEntitiesContainer from 'web/pages/reports/details/ReportEntitiesContainer';
import {
  makeCompareNumber,
  makeCompareSeverity,
  makeCompareString,
} from 'web/utils/Sort';

interface ApplicationsTabProps {
  filter?: Filter;
  reportId: string;
  status: TaskStatus;
}

export const appsSortFunctions = {
  name: makeCompareString('name'),
  hosts: makeCompareNumber(entity => entity.hosts.count),
  occurrences: makeCompareNumber(entity => entity.occurrences.total),
  severity: makeCompareSeverity(),
};

const ApplicationsTabWrapper = ({
  filter,
  reportId,
  status,
}: ApplicationsTabProps) => {
  const [_] = useTranslation();

  const baseFilter = useMemo(() => {
    return isDefined(filter) ? filter.copy() : new Filter();
  }, [filter]);

  const [appsFilter, setAppsFilter] = useState<Filter>(baseFilter);

  const {data, isLoading, isFetching, isError, error} =
    useGetReportApplications({
      reportId,
      filter: appsFilter,
      refetchInterval: isActive(status)
        ? USE_DEFAULT_RELOAD_INTERVAL_ACTIVE
        : NO_RELOAD,
    });

  const updateFilter = (newFilter: Filter) => {
    setAppsFilter(newFilter);
  };

  const [sortBy, sortDir, handleSortChange] = useFilterSortBy(
    appsFilter,
    updateFilter,
  );

  if (isError) {
    return (
      <ErrorPanel
        error={error}
        message={_('Error while loading Applications for Report {{reportId}}', {
          reportId,
        })}
      />
    );
  }

  const {entities: applications = [], entitiesCounts: applicationsCounts} =
    data || {};

  const displayedFilter = appsFilter;

  if (isLoading && !data) {
    return <Loading />;
  }

  return (
    <ReportEntitiesContainer
      counts={applicationsCounts}
      entities={applications}
      filter={displayedFilter}
      sortField={sortBy || 'name'}
      sortFunctions={appsSortFunctions}
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
        <ApplicationsTable
          // @ts-expect-error entities are ReportApp[], not Model[]
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

export default ApplicationsTabWrapper;

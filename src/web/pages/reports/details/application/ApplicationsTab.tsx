/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useEffect, useMemo, useState} from 'react';
import {useTranslation} from 'react-i18next';
import BaseFilter from 'gmp/models/filter/base-filter';
import type FilterType from 'gmp/models/filter/filter-type';
import type ReportApp from 'gmp/models/report/app';
import {isDefined} from 'gmp/utils/identity';
import ErrorPanel from 'web/components/error/ErrorPanel';
import Loading from 'web/components/loading/Loading';
import useFilterSortBy from 'web/hooks/useFilterSortBy';
import ApplicationsTable from 'web/pages/reports/details/application/ApplicationsTable';
import ReportEntitiesContainer from 'web/pages/reports/details/ReportEntitiesContainer';
import {type UseGetEntitiesReturn} from 'web/queries/useGetEntities';
import {
  makeCompareNumber,
  makeCompareSeverity,
  makeCompareString,
} from 'web/utils/Sort';

interface ApplicationsTabProps {
  filter?: FilterType;
  reportId: string;
  applicationsData?: UseGetEntitiesReturn<ReportApp>;
  isApplicationsFetching?: boolean;
  isApplicationsError?: boolean;
}

export const appsSortFunctions = {
  name: makeCompareString('name'),
  hosts: makeCompareNumber((entity: ReportApp) => entity.hosts.count),
  occurrences: makeCompareNumber(
    (entity: ReportApp) => entity.occurrences.total,
  ),
  severity: makeCompareSeverity(),
};

const ApplicationsTabWrapper = ({
  filter,
  reportId,
  isApplicationsError,
  applicationsData,
  isApplicationsFetching,
}: ApplicationsTabProps) => {
  const [_] = useTranslation();

  const baseFilter = useMemo(() => {
    return isDefined(filter) ? filter : new BaseFilter();
  }, [filter]);

  const [appsFilter, setAppsFilter] = useState<FilterType>(baseFilter);

  useEffect(() => {
    setAppsFilter(baseFilter);
  }, [baseFilter]);

  const data = applicationsData;
  const isFetching = isApplicationsFetching ?? false;
  const isLoading = !data && isFetching;
  const isError = isApplicationsError ?? false;

  const updateFilter = (newFilter: FilterType) => {
    setAppsFilter(newFilter);
  };

  const [sortBy, sortDir, handleSortChange] = useFilterSortBy(
    appsFilter,
    updateFilter,
  );

  const {entities: applications = [], entitiesCounts: applicationsCounts} =
    data || {};

  const displayedFilter = appsFilter;

  if (isLoading && !data) {
    return <Loading />;
  }

  if (isError) {
    return (
      <ErrorPanel
        message={_('Error while loading Applications for Report {{reportId}}', {
          reportId,
        })}
      />
    );
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

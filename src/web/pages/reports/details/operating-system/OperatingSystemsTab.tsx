/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useEffect, useMemo, useState} from 'react';
import {useTranslation} from 'react-i18next';
import Filter from 'gmp/models/filter';
import type ReportOperatingSystem from 'gmp/models/report/os';
import {isDefined} from 'gmp/utils/identity';
import Loading from 'web/components/loading/Loading';
import useFilterSortBy from 'web/hooks/useFilterSortBy';
import OperatingSystemsTable from 'web/pages/reports/details/operating-system/OperatingSystemsTable';
import ReportEntitiesContainer from 'web/pages/reports/details/ReportEntitiesContainer';
import {type UseGetEntitiesReturn} from 'web/queries/useGetEntities';
import {makeCompareNumber, makeCompareString} from 'web/utils/Sort';

interface OperatingSystemsTabWrapperProps {
  audit?: boolean;
  filter?: Filter;
  reportId: string;
  operatingSystemsData?: UseGetEntitiesReturn<ReportOperatingSystem>;
  isOperatingSystemsFetching?: boolean;
  isOperatingSystemsError?: boolean;
}

type OperatingSystemsSortFunctions = {
  name: (
    sortReverse?: boolean,
  ) => (a: ReportOperatingSystem, b: ReportOperatingSystem) => number;
  cpe: (
    sortReverse?: boolean,
  ) => (a: ReportOperatingSystem, b: ReportOperatingSystem) => number;
  hosts: (
    sortReverse?: boolean,
  ) => (a: ReportOperatingSystem, b: ReportOperatingSystem) => number;
  compliant: (
    sortReverse?: boolean,
  ) => (a: ReportOperatingSystem, b: ReportOperatingSystem) => number;
};

const operatingSystemsSortFunctions: OperatingSystemsSortFunctions = {
  name: makeCompareString('name'),
  cpe: makeCompareString('id'),
  hosts: makeCompareNumber(entity => entity.hosts.count),
  compliant: makeCompareString('compliance'),
};

const OperatingSystemsTabWrapper = ({
  filter,
  reportId,
  audit = false,
  operatingSystemsData,
  isOperatingSystemsFetching,
  isOperatingSystemsError,
}: OperatingSystemsTabWrapperProps) => {
  const [_] = useTranslation();

  const baseFilter = useMemo(() => {
    return isDefined(filter) ? filter.copy() : new Filter();
  }, [filter]);

  const [operatingSystemsFilter, setOperatingSystemsFilter] =
    useState<Filter>(baseFilter);

  useEffect(() => {
    setOperatingSystemsFilter(baseFilter);
  }, [baseFilter]);

  const data = operatingSystemsData;
  const isFetching = isOperatingSystemsFetching ?? false;
  const isLoading = !data && isFetching;
  const isError = isOperatingSystemsError ?? false;

  const updateFilter = (newFilter: Filter) => {
    setOperatingSystemsFilter(newFilter);
  };

  const [sortBy, sortDir, handleSortChange] = useFilterSortBy(
    operatingSystemsFilter,
    updateFilter,
  );

  const operatingSystems = data?.entities ?? [];

  if (isError) {
    return (
      <div className="error">
        {_('Error while loading Operating Systems for Report {{reportId}}', {
          reportId,
        })}
      </div>
    );
  }

  const {entitiesCounts: operatingSystemsCounts} = data || {};

  const displayedFilter = operatingSystemsFilter;

  if (isLoading && !data) {
    return <Loading />;
  }

  return (
    <ReportEntitiesContainer
      counts={operatingSystemsCounts}
      entities={operatingSystems}
      filter={displayedFilter}
      sortField={sortBy || 'name'}
      sortFunctions={operatingSystemsSortFunctions}
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
        <OperatingSystemsTable
          audit={audit}
          // @ts-expect-error entities are ReportOperatingSystem[], not Model[]
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

export default OperatingSystemsTabWrapper;

/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useMemo, useState} from 'react';
import {useTranslation} from 'react-i18next';
import Filter from 'gmp/models/filter';
import ReportOperatingSystem from 'gmp/models/report/os';
import {isDefined} from 'gmp/utils/identity';
import Loading from 'web/components/loading/Loading';
import useGetReportOperatingSystems from 'web/hooks/use-query/report-operating-system';
import useFilterSortBy from 'web/hooks/useFilterSortBy';
import OperatingSystemsTable from 'web/pages/reports/details/OperatingSystemsTable';
import ReportEntitiesContainer from 'web/pages/reports/details/ReportEntitiesContainer';
import {makeCompareNumber, makeCompareString} from 'web/utils/Sort';

interface OperatingSystemsTabWrapperProps {
  audit?: boolean;
  filter?: Filter;
  reportId: string;
  /** Pre-parsed OS entities from the full report, used to enrich compliance. */
  reportOperatingSystems?: ReportOperatingSystem[];
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
  reportOperatingSystems,
}: OperatingSystemsTabWrapperProps) => {
  const [_] = useTranslation();

  const baseFilter = useMemo(() => {
    return isDefined(filter) ? filter.copy() : new Filter();
  }, [filter]);

  const [operatingSystemsFilter, setOperatingSystemsFilter] =
    useState<Filter>(baseFilter);

  const {data, isLoading, isFetching, isError} = useGetReportOperatingSystems({
    reportId,
    filter: operatingSystemsFilter,
  });

  const updateFilter = (newFilter: Filter) => {
    setOperatingSystemsFilter(newFilter);
  };

  const [sortBy, sortDir, handleSortChange] = useFilterSortBy(
    operatingSystemsFilter,
    updateFilter,
  );

  // Enrich entities from the dedicated endpoint with severity / compliance
  // data from the full report parse, which has that information.
  const operatingSystems = useMemo(() => {
    const fetchedEntities = data?.entities ?? [];
    if (!reportOperatingSystems?.length || !fetchedEntities.length) {
      return fetchedEntities;
    }
    const byKey = new Map(reportOperatingSystems.map(os => [os.cpe, os]));
    return fetchedEntities.map(os => {
      const source = byKey.get(os.cpe);
      if (!isDefined(source)) return os;
      const enriched = ReportOperatingSystem.fromElement({
        best_os_cpe: os.cpe,
        best_os_txt: os.name,
      });
      enriched.hosts.count = os.hosts.count;
      enriched.compliance = source.compliance;
      return enriched;
    });
  }, [data?.entities, reportOperatingSystems]);

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

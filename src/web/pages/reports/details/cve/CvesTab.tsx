/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useEffect, useMemo, useState} from 'react';
import {useTranslation} from 'react-i18next';
import type FilterType from 'gmp/models/filter/filter-type';
import QueryFilter from 'gmp/models/filter/query-filter';
import {type ReportActiveCve} from 'gmp/models/report/parser';
import {isDefined} from 'gmp/utils/identity';
import ErrorPanel from 'web/components/error/ErrorPanel';
import Loading from 'web/components/loading/Loading';
import useFilterSortBy from 'web/hooks/useFilterSortBy';
import CvesTable from 'web/pages/reports/details/cve/CvesTable';
import ReportEntitiesContainer from 'web/pages/reports/details/ReportEntitiesContainer';
import {type UseGetEntitiesReturn} from 'web/queries/useGetEntities';
import {
  makeCompareIp,
  makeCompareSeverity,
  makeCompareString,
} from 'web/utils/Sort';

interface CvesTabProps {
  filter?: FilterType;
  reportId: string;
  cvesData?: UseGetEntitiesReturn<ReportActiveCve>;
  isCvesFetching?: boolean;
  isCvesError?: boolean;
}

export const cvesSortFunctions = {
  cve: makeCompareString('cveId'),
  host: makeCompareIp((entity: ReportActiveCve) => entity.host?.ip),
  nvt: makeCompareString(
    (entity: ReportActiveCve) => entity.source?.description,
  ),
  severity: makeCompareSeverity(),
};

const CvesTabWrapper = ({
  filter,
  reportId,
  isCvesError,
  cvesData,
  isCvesFetching,
}: CvesTabProps) => {
  const [_] = useTranslation();

  const baseFilter = useMemo(() => {
    return isDefined(filter) ? filter : new QueryFilter();
  }, [filter]);

  const [cvesFilter, setCvesFilter] = useState<FilterType>(baseFilter);

  useEffect(() => {
    setCvesFilter(baseFilter);
  }, [baseFilter]);

  const data = cvesData;
  const isFetching = isCvesFetching ?? false;
  const isLoading = !data && isFetching;
  const isError = isCvesError ?? false;
  const updateFilter = (newFilter: FilterType) => {
    setCvesFilter(newFilter);
  };

  const [sortBy, sortDir, handleSortChange] = useFilterSortBy(
    cvesFilter,
    updateFilter,
  );

  const {entities: cves = [], entitiesCounts: cvesCounts} = data || {};

  const displayedFilter = cvesFilter;

  if (isLoading && !data) {
    return <Loading />;
  }

  if (isError) {
    return (
      <ErrorPanel
        message={_('Error while loading CVEs for Report {{reportId}}', {
          reportId,
        })}
      />
    );
  }

  return (
    <ReportEntitiesContainer
      counts={cvesCounts}
      entities={cves}
      filter={displayedFilter}
      sortField={sortBy || 'severity'}
      sortFunctions={cvesSortFunctions}
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
        <CvesTable
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

export default CvesTabWrapper;

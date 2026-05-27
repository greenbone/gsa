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
import useGetReportCves from 'web/hooks/use-query/report-cves';
import useFilterSortBy from 'web/hooks/useFilterSortBy';
import CvesTable from 'web/pages/reports/details/CvesTable';
import ReportEntitiesContainer from 'web/pages/reports/details/ReportEntitiesContainer';
import {
  makeCompareIp,
  makeCompareString,
  makeCompareSeverity,
} from 'web/utils/Sort';

interface CvesTabProps {
  filter?: Filter;
  reportId: string;
  status: TaskStatus;
}

export const cvesSortFunctions = {
  cve: makeCompareString('cveId'),
  host: makeCompareIp(entity => entity.host.ip),
  nvt: makeCompareString(entity => entity.source?.description),
  severity: makeCompareSeverity(),
};

const CvesTabWrapper = ({filter, reportId, status}: CvesTabProps) => {
  const [_] = useTranslation();

  const baseFilter = useMemo(() => {
    return isDefined(filter) ? filter.copy() : new Filter();
  }, [filter]);

  const [cvesFilter, setCvesFilter] = useState<Filter>(baseFilter);

  const {data, isLoading, isFetching, isError, error} = useGetReportCves({
    reportId,
    filter: cvesFilter,
    refetchInterval: isActive(status)
      ? USE_DEFAULT_RELOAD_INTERVAL_ACTIVE
      : NO_RELOAD,
  });

  const updateFilter = (newFilter: Filter) => {
    setCvesFilter(newFilter);
  };

  const [sortBy, sortDir, handleSortChange] = useFilterSortBy(
    cvesFilter,
    updateFilter,
  );

  if (isError) {
    return (
      <ErrorPanel
        error={error}
        message={_('Error while loading CVEs for Report {{reportId}}', {
          reportId,
        })}
      />
    );
  }

  const {entities: cves = [], entitiesCounts: cvesCounts} = data || {};

  const displayedFilter = cvesFilter;

  if (isLoading && !data) {
    return <Loading />;
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

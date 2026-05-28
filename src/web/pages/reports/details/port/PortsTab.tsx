/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useEffect, useMemo, useState} from 'react';
import Filter from 'gmp/models/filter';
import {isActive, type TaskStatus} from 'gmp/models/task';
import ErrorPanel from 'web/components/error/ErrorPanel';
import Loading from 'web/components/loading/Loading';
import {
  NO_RELOAD,
  USE_DEFAULT_RELOAD_INTERVAL_ACTIVE,
} from 'web/components/loading/Reload';
import useGetReportPorts from 'web/hooks/use-query/report-ports';
import useFilterSortBy from 'web/hooks/useFilterSortBy';
import useTranslation from 'web/hooks/useTranslation';
import ReportEntitiesContainer from 'web/pages/reports/details/ReportEntitiesContainer';
import PortsTable from 'web/pages/reports/details/port/PortsTable';
import {makeCompareNumber, makeCompareSeverity} from 'web/utils/Sort';

export const portsSortFunctions = {
  name: makeCompareNumber('number'),
  hosts: makeCompareNumber(entity => entity.hosts.count),
  severity: makeCompareSeverity(),
};

interface PortsTabProps {
  reportId: string;
  reportFilter: Filter;
  status: TaskStatus;
}

const PortsTab = ({reportId, reportFilter, status}: PortsTabProps) => {
  const [_] = useTranslation();
  const reportFilterString = reportFilter.toFilterString();

  const baseFilter = useMemo(() => {
    return Filter.fromString(reportFilterString);
  }, [reportFilterString]);

  const [portsFilter, setPortsFilter] = useState<Filter>(baseFilter);

  useEffect(() => {
    setPortsFilter(baseFilter);
  }, [baseFilter]);

  const {data, isLoading, isFetching, isError, error} = useGetReportPorts({
    reportId,
    filter: portsFilter,
    refetchInterval: isActive(status)
      ? USE_DEFAULT_RELOAD_INTERVAL_ACTIVE
      : NO_RELOAD,
  });

  const updateFilter = (newFilter: Filter) => {
    setPortsFilter(newFilter);
  };

  const [sortBy, sortDir, handleSortChange] = useFilterSortBy(
    portsFilter,
    updateFilter,
  );

  if (isError) {
    return (
      <ErrorPanel
        error={error}
        message={_('Error while loading Ports for Report {{reportId}}', {
          reportId,
        })}
      />
    );
  }

  if (isLoading && !data) {
    return <Loading />;
  }

  const {entities: ports = [], entitiesCounts: portsCounts} = data || {};

  return (
    <ReportEntitiesContainer
      counts={portsCounts}
      entities={ports}
      filter={portsFilter}
      sortField={sortBy || 'severity'}
      sortFunctions={portsSortFunctions}
      sortReverse={sortDir === 'asc'}
    >
      {({
        entities,
        entitiesCounts,
        sortBy: sortByPaged,
        sortDir: sortDirPaged,
        onFirstClick,
        onLastClick,
        onNextClick,
        onPreviousClick,
      }) => (
        <PortsTable
          // @ts-expect-error entities are ReportPort[], not Model[]
          entities={entities}
          entitiesCounts={entitiesCounts}
          filter={portsFilter}
          isUpdating={isFetching}
          sortBy={sortByPaged || 'severity'}
          sortDir={sortDirPaged}
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

export default PortsTab;

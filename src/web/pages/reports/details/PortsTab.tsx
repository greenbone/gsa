/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useEffect, useMemo, useState} from 'react';
import CollectionCounts from 'gmp/collection/collection-counts';
import Filter from 'gmp/models/filter';
import ErrorPanel from 'web/components/error/ErrorPanel';
import Loading from 'web/components/loading/Loading';
import useGetReportPorts from 'web/hooks/use-query/report-ports';
import useFilterSortBy from 'web/hooks/useFilterSortBy';
import usePagination from 'web/hooks/usePagination';
import useTranslation from 'web/hooks/useTranslation';
import PortsTable from 'web/pages/reports/details/PortsTable';

interface PortsTabProps {
  reportId: string;
  reportFilter: Filter;
}

const PortsTab = ({reportId, reportFilter}: PortsTabProps) => {
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
  });

  const updateFilter = (newFilter: Filter) => {
    setPortsFilter(newFilter);
  };

  const [sortBy, sortDir, handleSortChange] = useFilterSortBy(
    portsFilter,
    updateFilter,
  );

  const [
    handleFirstClick,
    handleLastClick,
    handleNextClick,
    handlePreviousClick,
  ] = usePagination(
    portsFilter,
    data?.entitiesCounts ?? new CollectionCounts(),
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
    <PortsTable
      // @ts-expect-error entities are ReportPort[], not Model[]
      entities={ports}
      entitiesCounts={portsCounts}
      filter={portsFilter}
      isUpdating={isFetching && !data}
      sortBy={sortBy || 'severity'}
      sortDir={sortDir}
      toggleDetailsIcon={false}
      onFirstClick={handleFirstClick}
      onLastClick={handleLastClick}
      onNextClick={handleNextClick}
      onPreviousClick={handlePreviousClick}
      onSortChange={handleSortChange}
    />
  );
};

export default PortsTab;

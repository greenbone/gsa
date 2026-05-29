/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useEffect, useMemo, useState} from 'react';
import Filter from 'gmp/models/filter';
import type ReportPort from 'gmp/models/report/port';
import ErrorPanel from 'web/components/error/ErrorPanel';
import Loading from 'web/components/loading/Loading';
import useFilterSortBy from 'web/hooks/useFilterSortBy';
import useTranslation from 'web/hooks/useTranslation';
import PortsTable from 'web/pages/reports/details/port/PortsTable';
import ReportEntitiesContainer from 'web/pages/reports/details/ReportEntitiesContainer';
import {type UseGetEntitiesReturn} from 'web/queries/useGetEntities';
import {makeCompareNumber, makeCompareSeverity} from 'web/utils/Sort';

interface PortsTabProps {
  reportId: string;
  reportFilter: Filter;
  portsData?: UseGetEntitiesReturn<ReportPort>;
  isPortsFetching?: boolean;
  isPortsError?: boolean;
}

export const portsSortFunctions = {
  name: makeCompareNumber('number'),
  hosts: makeCompareNumber(entity => entity.hosts.count),
  severity: makeCompareSeverity(),
};

const PortsTab = ({
  reportId,
  reportFilter,
  isPortsError,
  portsData,
  isPortsFetching,
}: PortsTabProps) => {
  const [_] = useTranslation();
  const reportFilterString = reportFilter.toFilterString();

  const baseFilter = useMemo(() => {
    return Filter.fromString(reportFilterString);
  }, [reportFilterString]);

  const [portsFilter, setPortsFilter] = useState<Filter>(baseFilter);

  useEffect(() => {
    setPortsFilter(baseFilter);
  }, [baseFilter]);

  const data = portsData;
  const isFetching = isPortsFetching ?? false;
  const isLoading = !data && isFetching;
  const isError = isPortsError ?? false;

  const updateFilter = (newFilter: Filter) => {
    setPortsFilter(newFilter);
  };

  const [sortBy, sortDir, handleSortChange] = useFilterSortBy(
    portsFilter,
    updateFilter,
  );

  if (isLoading && !data) {
    return <Loading />;
  }

  if (isError) {
    return (
      <ErrorPanel
        message={_('Error while loading Ports for Report {{reportId}}', {
          reportId,
        })}
      />
    );
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

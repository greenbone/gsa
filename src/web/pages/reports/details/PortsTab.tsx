/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type CollectionCounts from 'gmp/collection/collection-counts';
import type Filter from 'gmp/models/filter';
import type ReportPort from 'gmp/models/report/port';
import PortsTable from 'web/pages/reports/details/PortsTable';
import ReportEntitiesContainer from 'web/pages/reports/details/ReportEntitiesContainer';
import {
  makeCompareNumber,
  makeCompareSeverity,
  makeCompareString,
} from 'web/utils/Sort';

type EntityCompareFunc<TEntity> = (
  sortReverse?: boolean,
) => (a: TEntity, b: TEntity) => number;

interface PortsTabProps {
  counts?: CollectionCounts;
  filter: Filter;
  isUpdating?: boolean;
  ports?: ReportPort[];
  sortField: string;
  sortReverse: boolean;
  onSortChange: (sortField: string) => void;
}

const portsSortFunctions: Record<string, EntityCompareFunc<ReportPort>> = {
  name: makeCompareString('id'),
  hosts: makeCompareNumber((entity: ReportPort) => entity.hosts.count),
  severity: makeCompareSeverity(),
};

const PortsTab = ({
  counts,
  filter,
  isUpdating = false,
  ports,
  sortField,
  sortReverse,
  onSortChange,
}: PortsTabProps) => {
  return (
    <ReportEntitiesContainer<ReportPort>
      counts={counts}
      entities={ports}
      filter={filter}
      sortField={sortField}
      sortFunctions={portsSortFunctions}
      sortReverse={sortReverse}
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
        <PortsTable
          // @ts-expect-error entities are ReportPort[], not Model[]
          entities={entities}
          entitiesCounts={entitiesCounts}
          filter={filter}
          isUpdating={isUpdating}
          sortBy={sortBy}
          sortDir={sortDir}
          toggleDetailsIcon={false}
          onFirstClick={onFirstClick}
          onLastClick={onLastClick}
          onNextClick={onNextClick}
          onPreviousClick={onPreviousClick}
          onSortChange={onSortChange}
        />
      )}
    </ReportEntitiesContainer>
  );
};

export default PortsTab;

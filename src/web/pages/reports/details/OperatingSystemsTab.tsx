/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type CollectionCounts from 'gmp/collection/collection-counts';
import type Filter from 'gmp/models/filter';
import type ReportOperatingSystem from 'gmp/models/report/os';
import OperatingSystemsTable from 'web/pages/reports/details/OperatingSystemsTable';
import ReportEntitiesContainer from 'web/pages/reports/details/ReportEntitiesContainer';
import {makeCompareNumber, makeCompareString} from 'web/utils/Sort';

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
  severity: (
    sortReverse?: boolean,
  ) => (a: ReportOperatingSystem, b: ReportOperatingSystem) => number;
  compliant: (
    sortReverse?: boolean,
  ) => (a: ReportOperatingSystem, b: ReportOperatingSystem) => number;
};

interface OperatingSystemsTabProps {
  audit?: boolean;
  counts?: CollectionCounts;
  filter: Filter;
  isUpdating?: boolean;
  operatingsystems?: ReportOperatingSystem[];
  sortField: string;
  sortReverse: boolean;
  onSortChange: (sortField: string) => void;
}

const operatingssystemsSortFunctions: OperatingSystemsSortFunctions = {
  name: makeCompareString('name'),
  cpe: makeCompareString('id'),
  hosts: makeCompareNumber(entity => entity.hosts.count),
  severity: makeCompareNumber('severity', 0),
  compliant: makeCompareString('compliance'),
};

const OperatingSystemsTab = ({
  audit = false,
  counts,
  filter,
  operatingsystems,
  isUpdating,
  sortField,
  sortReverse,
  onSortChange,
}: OperatingSystemsTabProps) => {
  return (
    <ReportEntitiesContainer<ReportOperatingSystem>
      counts={counts}
      entities={operatingsystems}
      filter={filter}
      sortField={sortField}
      sortFunctions={operatingssystemsSortFunctions}
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
        <OperatingSystemsTable
          audit={audit}
          // @ts-expect-error entities are ReportOperatingSystem[], not Model[]
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

export default OperatingSystemsTab;

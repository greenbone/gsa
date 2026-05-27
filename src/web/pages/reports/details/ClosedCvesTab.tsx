/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type CollectionCounts from 'gmp/collection/collection-counts';
import type Filter from 'gmp/models/filter';
import type {ReportClosedCve} from 'gmp/models/report/parser';
import ClosedCvesTable from 'web/pages/reports/details/ClosedCvesTable';
import ReportEntitiesContainer from 'web/pages/reports/details/ReportEntitiesContainer';
import {
  makeCompareIp,
  makeCompareString,
  makeCompareSeverity,
} from 'web/utils/Sort';

interface ClosedCvesTabProps {
  counts?: CollectionCounts;
  closedCves?: ReportClosedCve[];
  filter: Filter;
  isUpdating?: boolean;
  sortField: string;
  sortReverse: boolean;
  onSortChange: (sortField: string) => void;
}

const closedCvesSortFunctions = {
  cve: makeCompareString('cveId'),
  host: makeCompareIp((entity: ReportClosedCve) => entity.host.ip),
  nvt: makeCompareString(
    (entity: ReportClosedCve) => entity.source?.description,
  ),
  severity: makeCompareSeverity(),
};

const ClosedCvesTab = ({
  counts,
  closedCves,
  filter,
  isUpdating,
  sortField,
  sortReverse,
  onSortChange,
}: ClosedCvesTabProps) => (
  <ReportEntitiesContainer
    counts={counts}
    entities={closedCves}
    filter={filter}
    sortField={sortField}
    sortFunctions={closedCvesSortFunctions}
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
      <ClosedCvesTable
        // @ts-expect-error entities are ReportClosedCve[], not Model[]
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

export default ClosedCvesTab;

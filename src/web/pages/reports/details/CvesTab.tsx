/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type CollectionCounts from 'gmp/collection/collection-counts';
import type Filter from 'gmp/models/filter';
import type {ReportActiveCve} from 'gmp/models/report/parser';
import CvesTable from 'web/pages/reports/details/CvesTable';
import ReportEntitiesContainer from 'web/pages/reports/details/ReportEntitiesContainer';
import {
  makeCompareIp,
  makeCompareString,
  makeCompareSeverity,
} from 'web/utils/Sort';

interface CvesTabProps {
  counts?: CollectionCounts;
  cves?: ReportActiveCve[];
  filter: Filter;
  isUpdating?: boolean;
  sortField: string;
  sortReverse: boolean;
  onSortChange: (sortField: string) => void;
}

const cvesSortFunctions = {
  cve: makeCompareString('cveId'),
  host: makeCompareIp((entity: ReportActiveCve) => entity.host.ip),
  nvt: makeCompareString(
    (entity: ReportActiveCve) => entity.source?.description,
  ),
  severity: makeCompareSeverity(),
};

const CvesTab = ({
  counts,
  cves,
  filter,
  isUpdating,
  sortField,
  sortReverse,
  onSortChange,
}: CvesTabProps) => (
  <ReportEntitiesContainer
    counts={counts}
    entities={cves}
    filter={filter}
    sortField={sortField}
    sortFunctions={cvesSortFunctions}
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
      <CvesTable
        // @ts-expect-error entities are ReportActiveCve[], not Model[]
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

export default CvesTab;

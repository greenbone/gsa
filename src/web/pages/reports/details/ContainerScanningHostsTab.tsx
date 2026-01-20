/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type CollectionCounts from 'gmp/collection/collection-counts';
import type Filter from 'gmp/models/filter';
import type ReportHost from 'gmp/models/report/host';
import ContainerScanningHostsTable from 'web/pages/reports/details/ContainerScanningHostsTable';
import ReportEntitiesContainer from 'web/pages/reports/details/ReportEntitiesContainer';
import {
  makeCompareDate,
  makeCompareIp,
  makeCompareNumber,
  makeCompareSeverity,
  makeCompareString,
} from 'web/utils/Sort';

interface ContainerScanningHostsTabProps {
  audit?: boolean;
  counts?: CollectionCounts;
  hosts?: ReportHost[];
  filter: Filter;
  isUpdating?: boolean;
  sortField: string;
  sortReverse: boolean;
  onSortChange: (sortField: string) => void;
}

const containerScanningHostsSortFunctions = {
  ip: makeCompareIp('ip'),
  hostname: makeCompareString('hostname'),
  portsCount: makeCompareNumber(entity => entity.portsCount),
  appsCount: makeCompareNumber(entity => entity.details.appsCount),
  distance: makeCompareNumber(entity => entity.details.distance),
  os: makeCompareString(entity => entity.details.best_os_cpe),
  critical: makeCompareNumber(entity => entity.result_counts.critical),
  high: makeCompareNumber(entity => entity.result_counts.high),
  medium: makeCompareNumber(entity => entity.result_counts.warning),
  low: makeCompareNumber(entity => entity.result_counts.info),
  log: makeCompareNumber(entity => entity.result_counts.log),
  false_positive: makeCompareNumber(
    entity => entity.result_counts.false_positive,
  ),
  severity: makeCompareSeverity(),
  start: makeCompareDate(entity => entity.start),
  end: makeCompareDate(entity => entity.end),
  total: makeCompareNumber(entity => entity.result_counts.total),
  complianceYes: makeCompareNumber(entity => entity.complianceCounts.yes),
  complianceNo: makeCompareNumber(entity => entity.complianceCounts.no),
  complianceIncomplete: makeCompareNumber(
    entity => entity.complianceCounts.incomplete,
  ),
  complianceTotal: makeCompareNumber(entity => entity.complianceCounts.total),
  compliant: makeCompareString('hostCompliance'),
};

const ContainerScanningHostsTab = ({
  audit = false,
  counts,
  hosts,
  filter,
  isUpdating = false,
  sortField,
  sortReverse,
  onSortChange,
}: ContainerScanningHostsTabProps) => {
  return (
    <ReportEntitiesContainer<ReportHost>
      counts={counts}
      entities={hosts}
      filter={filter}
      sortField={sortField}
      sortFunctions={containerScanningHostsSortFunctions}
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
        <ContainerScanningHostsTable
          audit={audit}
          // @ts-expect-error
          entities={entities}
          entitiesCounts={entitiesCounts}
          filter={filter}
          isUpdating={isUpdating}
          sortBy={sortBy}
          sortDir={sortDir}
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

export default ContainerScanningHostsTab;

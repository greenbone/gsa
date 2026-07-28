/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type CollectionCounts from 'gmp/collection/collection-counts';
import {type FilterType} from 'gmp/models/filter';
import type ReportHost from 'gmp/models/report/host';
import AgentScanningHostsTable from 'web/pages/reports/details/host/AgentScanningHostsTable';
import ReportEntitiesContainer from 'web/pages/reports/details/ReportEntitiesContainer';
import {
  makeCompareIp,
  makeCompareNumber,
  makeCompareSeverity,
  makeCompareString,
} from 'web/utils/sort';

interface AgentScanningHostsTabProps {
  audit?: boolean;
  counts?: CollectionCounts;
  hosts?: ReportHost[];
  filter: FilterType;
  isUpdating?: boolean;
  sortField: string;
  sortReverse: boolean;
  onSortChange: (sortField: string) => void;
}

const agentScanningHostsSortFunctions = {
  ip: makeCompareIp<ReportHost>('ip'),
  hostname: makeCompareString<ReportHost>('hostname'),
  agentId: makeCompareString((entity: ReportHost) => entity.details?.agentId),
  portsCount: makeCompareNumber((entity: ReportHost) => entity.portsCount),
  appsCount: makeCompareNumber(
    (entity: ReportHost) => entity.details?.appsCount,
  ),
  distance: makeCompareNumber((entity: ReportHost) => entity.details?.distance),
  os: makeCompareString((entity: ReportHost) => entity.details?.best_os_cpe),
  critical: makeCompareNumber(
    (entity: ReportHost) => entity.result_counts.critical,
  ),
  high: makeCompareNumber((entity: ReportHost) => entity.result_counts.high),
  medium: makeCompareNumber(
    (entity: ReportHost) => entity.result_counts.medium,
  ),
  low: makeCompareNumber((entity: ReportHost) => entity.result_counts.low),
  log: makeCompareNumber((entity: ReportHost) => entity.result_counts.log),
  false_positive: makeCompareNumber(
    (entity: ReportHost) => entity.result_counts.false_positive,
  ),
  severity: makeCompareSeverity(),
  total: makeCompareNumber((entity: ReportHost) => entity.result_counts.total),
  complianceYes: makeCompareNumber(
    (entity: ReportHost) => entity.complianceCounts.yes,
  ),
  complianceNo: makeCompareNumber(
    (entity: ReportHost) => entity.complianceCounts.no,
  ),
  complianceIncomplete: makeCompareNumber(
    (entity: ReportHost) => entity.complianceCounts.incomplete,
  ),
  complianceTotal: makeCompareNumber(
    (entity: ReportHost) => entity.complianceCounts.total,
  ),
  compliant: makeCompareString<ReportHost>('hostCompliance'),
};

const AgentScanningHostsTab = ({
  audit = false,
  counts,
  hosts,
  filter,
  isUpdating = false,
  sortField,
  sortReverse,
  onSortChange,
}: AgentScanningHostsTabProps) => {
  return (
    <ReportEntitiesContainer<ReportHost>
      counts={counts}
      entities={hosts}
      filter={filter}
      sortField={sortField}
      sortFunctions={agentScanningHostsSortFunctions}
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
        <AgentScanningHostsTable
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

export default AgentScanningHostsTab;

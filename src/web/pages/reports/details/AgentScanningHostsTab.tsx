/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type CollectionCounts from 'gmp/collection/collection-counts';
import type Filter from 'gmp/models/filter';
import type ReportHost from 'gmp/models/report/host';
import AgentScanningHostsTable from 'web/pages/reports/details/AgentScanningHostsTable';
import ReportEntitiesContainer from 'web/pages/reports/details/ReportEntitiesContainer';
import {
  makeCompareIp,
  makeCompareNumber,
  makeCompareSeverity,
  makeCompareString,
} from 'web/utils/Sort';

interface AgentScanningHostsTabProps {
  audit?: boolean;
  counts?: CollectionCounts;
  hosts?: ReportHost[];
  filter: Filter;
  isUpdating?: boolean;
  sortField: string;
  sortReverse: boolean;
  onSortChange: (sortField: string) => void;
}

const agentScanningHostsSortFunctions = {
  ip: makeCompareIp('ip'),
  hostname: makeCompareString('hostname'),
  agentId: makeCompareString(entity => entity.details?.agentId),
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
  total: makeCompareNumber(entity => entity.result_counts.total),
  complianceYes: makeCompareNumber(entity => entity.complianceCounts.yes),
  complianceNo: makeCompareNumber(entity => entity.complianceCounts.no),
  complianceIncomplete: makeCompareNumber(
    entity => entity.complianceCounts.incomplete,
  ),
  complianceTotal: makeCompareNumber(entity => entity.complianceCounts.total),
  compliant: makeCompareString('hostCompliance'),
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

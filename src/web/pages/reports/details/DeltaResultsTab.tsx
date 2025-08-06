/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import CollectionCounts from 'gmp/collection/CollectionCounts';
import Filter from 'gmp/models/filter';
import Nvt from 'gmp/models/nvt';
import Result from 'gmp/models/result';
import {TaskStatus} from 'gmp/models/task';
import EmptyReport from 'web/pages/reports/details/EmptyReport';
import EmptyResultsReport from 'web/pages/reports/details/EmptyResultsReport';
import ReportEntitiesContainer from 'web/pages/reports/details/ReportEntitiesContainer';
import ResultsTable from 'web/pages/results/ResultsTable';
import {
  makeCompareDate,
  makeCompareIp,
  makeCompareNumber,
  makeCompareSeverity,
  makeCompareString,
} from 'web/utils/Sort';

interface DeltaResultsTabProps {
  audit?: boolean;
  counts: CollectionCounts;
  delta?: boolean;
  filter: Filter;
  hasTarget?: boolean;
  isUpdating?: boolean;
  progress: number;
  results: Result[];
  sortField: string;
  sortReverse: boolean;
  status: TaskStatus;
  onFilterAddLogLevelClick: () => void;
  onFilterDecreaseMinQoDClick: () => void;
  onFilterEditClick: () => void;
  onFilterRemoveClick: () => void;
  onFilterRemoveSeverityClick: () => void;
  onSortChange: (sortBy: string) => void;
  onTargetEditClick: () => void;
}

const resultsSortFunctions = {
  delta: makeCompareString((entity: Result) => entity.delta?.delta_type),
  created: makeCompareDate('creationTime'),
  host: makeCompareIp((entity: Result) => entity.host?.name),
  hostname: makeCompareString((entity: Result) => entity.host?.hostname),
  location: makeCompareString('port'),
  qod: makeCompareNumber((entity: Result) => entity.qod?.value),
  severity: makeCompareSeverity(),
  solution_type: makeCompareString(
    (entity: Result) => (entity.information as Nvt | undefined)?.solution?.type,
  ),
  vulnerability: makeCompareString('vulnerability'),
  compliant: makeCompareString('compliance'),
};

const DeltaResultsTab = ({
  audit = false,
  counts,
  delta = false,
  filter,
  hasTarget,
  isUpdating = false,
  progress,
  results,
  sortField,
  sortReverse,
  status,
  onFilterAddLogLevelClick,
  onFilterDecreaseMinQoDClick,
  onFilterEditClick,
  onFilterRemoveSeverityClick,
  onFilterRemoveClick,
  onSortChange,
  onTargetEditClick,
}: DeltaResultsTabProps) => {
  if (counts.filtered === 0) {
    if (counts.all === 0) {
      return (
        <EmptyReport
          hasTarget={hasTarget}
          progress={progress}
          status={status}
          onTargetEditClick={onTargetEditClick}
        />
      );
    } else if (counts.all > 0) {
      return (
        <EmptyResultsReport
          all={counts.all}
          filter={filter}
          onFilterAddLogLevelClick={onFilterAddLogLevelClick}
          onFilterDecreaseMinQoDClick={onFilterDecreaseMinQoDClick}
          onFilterEditClick={onFilterEditClick}
          onFilterRemoveClick={onFilterRemoveClick}
          onFilterRemoveSeverityClick={onFilterRemoveSeverityClick}
        />
      );
    }
  }
  return (
    <ReportEntitiesContainer
      counts={counts}
      entities={results}
      filter={filter}
      sortField={sortField}
      sortFunctions={resultsSortFunctions}
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
        <ResultsTable
          audit={audit}
          delta={delta}
          entities={entities}
          entitiesCounts={entitiesCounts}
          filter={filter}
          footer={false}
          isUpdating={isUpdating}
          links={!delta}
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

export default DeltaResultsTab;

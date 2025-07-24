/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import EmptyReport from 'web/pages/reports/details/EmptyReport';
import EmptyResultsReport from 'web/pages/reports/details/EmptyResultsReport';
import ReportEntitiesContainer from 'web/pages/reports/details/ReportEntitiesContainer';
import ResultsTable from 'web/pages/results/Table';
import PropTypes from 'web/utils/PropTypes';
import {
  makeCompareDate,
  makeCompareIp,
  makeCompareNumber,
  makeCompareSeverity,
  makeCompareString,
} from 'web/utils/Sort';

const resultsSortFunctions = {
  delta: makeCompareString(entity => entity.delta.delta_type),
  created: makeCompareDate('creationTime'),
  host: makeCompareIp(entity => entity.host.name),
  hostname: makeCompareString(entity => entity.host.hostname),
  location: makeCompareString('port'),
  qod: makeCompareNumber(entity => entity.qod.value),
  severity: makeCompareSeverity(),
  solution_type: makeCompareString(entity => entity.nvt.solution?.type),
  vulnerability: makeCompareString('vulnerability'),
  compliant: makeCompareString('compliance'),
};

const ResultsTab = ({
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
}) => {
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

ResultsTab.propTypes = {
  audit: PropTypes.bool,
  counts: PropTypes.oneOfType([PropTypes.counts, PropTypes.object]).isRequired,
  delta: PropTypes.bool,
  filter: PropTypes.filter.isRequired,
  hasTarget: PropTypes.bool,
  isUpdating: PropTypes.bool,
  progress: PropTypes.number.isRequired,
  results: PropTypes.array,
  sortField: PropTypes.string.isRequired,
  sortReverse: PropTypes.bool.isRequired,
  status: PropTypes.string.isRequired,
  onFilterAddLogLevelClick: PropTypes.func.isRequired,
  onFilterDecreaseMinQoDClick: PropTypes.func.isRequired,
  onFilterEditClick: PropTypes.func.isRequired,
  onFilterRemoveClick: PropTypes.func.isRequired,
  onFilterRemoveSeverityClick: PropTypes.func.isRequired,
  onSortChange: PropTypes.func.isRequired,
  onTargetEditClick: PropTypes.func.isRequired,
};

export default ResultsTab;

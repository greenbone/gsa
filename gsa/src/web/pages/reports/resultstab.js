/* Copyright (C) 2017-2019 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 */

import React from 'react';

import PropTypes from '../../utils/proptypes.js';

import ResultsTable from '../results/table.js';

import EmptyReport from './emptyreport.js';
import EmptyResultsReport from './emptyresultsreport.js';
import ReportEntitiesContainer from './reportentitiescontainer.js';

import {resultsSortFunctions} from './sort.js';

const ResultsTab = ({
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
  onInteraction,
  onSortChange,
  onTargetEditClick,
}) => {
  if (counts.filtered === 0) {
    if (counts.all === 0) {
      return (
        <EmptyReport
          hasTarget={hasTarget}
          status={status}
          progress={progress}
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
      entities={results}
      counts={counts}
      filter={filter}
      sortField={sortField}
      sortFunctions={resultsSortFunctions}
      sortReverse={sortReverse}
      onInteraction={onInteraction}
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
          delta={delta}
          entities={entities}
          entitiesCounts={entitiesCounts}
          filter={filter}
          footer={false}
          isUpdating={isUpdating}
          sortBy={sortBy}
          sortDir={sortDir}
          toggleDetailsIcon={false}
          onSortChange={onSortChange}
          onFirstClick={onFirstClick}
          onLastClick={onLastClick}
          onNextClick={onNextClick}
          onPreviousClick={onPreviousClick}
        />
      )}
    </ReportEntitiesContainer>
  );
};

ResultsTab.propTypes = {
  counts: PropTypes.counts.isRequired,
  delta: PropTypes.bool,
  filter: PropTypes.filter.isRequired,
  hasTarget: PropTypes.bool,
  isUpdating: PropTypes.bool,
  progress: PropTypes.number.isRequired,
  results: PropTypes.array.isRequired,
  sortField: PropTypes.string.isRequired,
  sortReverse: PropTypes.bool.isRequired,
  status: PropTypes.string.isRequired,
  onFilterAddLogLevelClick: PropTypes.func.isRequired,
  onFilterDecreaseMinQoDClick: PropTypes.func.isRequired,
  onFilterEditClick: PropTypes.func.isRequired,
  onFilterRemoveClick: PropTypes.func.isRequired,
  onFilterRemoveSeverityClick: PropTypes.func.isRequired,
  onInteraction: PropTypes.func.isRequired,
  onSortChange: PropTypes.func.isRequired,
  onTargetEditClick: PropTypes.func.isRequired,
};

export default ResultsTab;

// vim: set ts=2 sw=2 tw=80:

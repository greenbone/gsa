/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */


import React from 'react';
import PropTypes from 'web/utils/proptypes';
import {
  makeCompareIp,
  makeCompareString,
  makeCompareSeverity,
} from 'web/utils/sort';

import ClosedCvesTable from './closedcvestable';
import ReportEntitiesContainer from './reportentitiescontainer';



const closedCvesSortFunctions = {
  cve: makeCompareString('cveId'),
  host: makeCompareIp(entity => entity.host.ip),
  nvt: makeCompareString(entity => entity.source.description),
  severity: makeCompareSeverity(),
};

const ClosedCvesTab = ({
  counts,
  closedCves,
  filter,
  isUpdating,
  sortField,
  sortReverse,
  onInteraction,
  onSortChange,
}) => (
  <ReportEntitiesContainer
    counts={counts}
    entities={closedCves}
    filter={filter}
    sortField={sortField}
    sortFunctions={closedCvesSortFunctions}
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
      <ClosedCvesTable
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

ClosedCvesTab.propTypes = {
  closedCves: PropTypes.array,
  counts: PropTypes.object,
  filter: PropTypes.filter.isRequired,
  isUpdating: PropTypes.bool,
  sortField: PropTypes.string.isRequired,
  sortReverse: PropTypes.bool.isRequired,
  onInteraction: PropTypes.func.isRequired,
  onSortChange: PropTypes.func.isRequired,
};

export default ClosedCvesTab;

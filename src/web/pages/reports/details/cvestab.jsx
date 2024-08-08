/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */


import React from 'react';

import CvesTable from './cvestable';
import ReportEntitiesContainer from './reportentitiescontainer';

import PropTypes from 'web/utils/proptypes';

import {
  makeCompareNumber,
  makeCompareString,
  makeCompareSeverity,
} from 'web/utils/sort';

const cvesSortFunctions = {
  cve: makeCompareString(entity => entity.cves.join(' ')),
  hosts: makeCompareNumber(entity => entity.hosts.count),
  nvt: makeCompareString(entity => entity.nvtName),
  occurrences: makeCompareNumber(entity => entity.occurrences),
  severity: makeCompareSeverity(),
};

const CvesTab = ({
  counts,
  cves,
  filter,
  isUpdating,
  sortField,
  sortReverse,
  onInteraction,
  onSortChange,
}) => (
  <ReportEntitiesContainer
    counts={counts}
    entities={cves}
    filter={filter}
    sortFunctions={cvesSortFunctions}
    sortField={sortField}
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
      <CvesTable
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

CvesTab.propTypes = {
  counts: PropTypes.object,
  cves: PropTypes.array,
  filter: PropTypes.filter.isRequired,
  isUpdating: PropTypes.bool,
  sortField: PropTypes.string.isRequired,
  sortReverse: PropTypes.bool.isRequired,
  onInteraction: PropTypes.func.isRequired,
  onSortChange: PropTypes.func.isRequired,
};

export default CvesTab;

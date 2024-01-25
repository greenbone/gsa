/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */


import React from 'react';

import OperatingSystemsTable from './operatingsystemstable';
import ReportEntitiesContainer from './reportentitiescontainer';

import PropTypes from 'web/utils/proptypes';

import {makeCompareNumber, makeCompareString} from 'web/utils/sort';

const operatingssystemsSortFunctions = {
  name: makeCompareString('name'),
  cpe: makeCompareString('id'),
  hosts: makeCompareNumber(entity => entity.hosts.count),
  severity: makeCompareNumber('severity', 0),
  // TODO Add filter for compliant
};

const OperatingSystemsTab = ({
  audit = false,
  counts,
  filter,
  operatingsystems,
  isUpdating,
  sortField,
  sortReverse,
  onInteraction,
  onSortChange,
}) => (
  <ReportEntitiesContainer
    counts={counts}
    entities={operatingsystems}
    filter={filter}
    sortFunctions={operatingssystemsSortFunctions}
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
      <OperatingSystemsTable
        audit={audit}
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

OperatingSystemsTab.propTypes = {
  audit: PropTypes.bool,
  counts: PropTypes.object,
  filter: PropTypes.filter.isRequired,
  isUpdating: PropTypes.bool,
  operatingsystems: PropTypes.array,
  sortField: PropTypes.string.isRequired,
  sortReverse: PropTypes.bool.isRequired,
  onInteraction: PropTypes.func.isRequired,
  onSortChange: PropTypes.func.isRequired,
};

export default OperatingSystemsTab;

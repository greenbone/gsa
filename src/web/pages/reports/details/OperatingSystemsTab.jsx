/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import OperatingSystemsTable from 'web/pages/reports/details/OperatingSystemsTable';
import ReportEntitiesContainer from 'web/pages/reports/details/ReportEntitiesContainer';
import PropTypes from 'web/utils/PropTypes';
import {makeCompareNumber, makeCompareString} from 'web/utils/Sort';

const operatingssystemsSortFunctions = {
  name: makeCompareString('name'),
  cpe: makeCompareString('id'),
  hosts: makeCompareNumber(entity => entity.hosts.count),
  severity: makeCompareNumber('severity', 0),
  compliant: makeCompareString('compliance'),
};

const OperatingSystemsTab = ({
  audit = false,
  counts,
  filter,
  operatingsystems,
  isUpdating,
  sortField,
  sortReverse,

  onSortChange,
}) => (
  <ReportEntitiesContainer
    counts={counts}
    entities={operatingsystems}
    filter={filter}
    sortField={sortField}
    sortFunctions={operatingssystemsSortFunctions}
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
  onSortChange: PropTypes.func.isRequired,
};

export default OperatingSystemsTab;

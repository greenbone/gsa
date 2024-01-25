/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */


import React from 'react';

import PropTypes from 'web/utils/proptypes';

import {
  makeCompareDate,
  makeCompareIp,
  makeCompareNumber,
  makeCompareSeverity,
  makeCompareString,
} from 'web/utils/sort';

import HostsTable from './hoststable';
import ReportEntitiesContainer from './reportentitiescontainer';

const hostsSortFunctions = {
  ip: makeCompareIp('ip'),
  hostname: makeCompareString('hostname'),
  portsCount: makeCompareNumber(entity => entity.portsCount),
  appsCount: makeCompareNumber(entity => entity.details.appsCount),
  distance: makeCompareNumber(entity => entity.details.distance),
  os: makeCompareString(entity => entity.details.best_os_cpe),
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
  compliance_yes: makeCompareNumber(entity => entity.compliance_counts.yes),
  compliance_no: makeCompareNumber(entity => entity.compliance_counts.no),
  compliance_incomplete: makeCompareNumber(
    entity => entity.compliance_counts.incomplete,
  ),
  compliance_total: makeCompareNumber(entity => entity.compliance_counts.total),
  // TODO Add filter for compliant
};

const HostsTab = ({
  audit = false,
  counts,
  hosts,
  filter,
  isUpdating = false,
  sortField,
  sortReverse,
  onSortChange,
  onInteraction,
}) => (
  <ReportEntitiesContainer
    counts={counts}
    entities={hosts}
    filter={filter}
    sortField={sortField}
    sortReverse={sortReverse}
    sortFunctions={hostsSortFunctions}
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
      <HostsTable
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

HostsTab.propTypes = {
  audit: PropTypes.bool,
  counts: PropTypes.object,
  filter: PropTypes.filter.isRequired,
  hosts: PropTypes.array,
  isUpdating: PropTypes.bool,
  sortField: PropTypes.string.isRequired,
  sortReverse: PropTypes.bool.isRequired,
  onInteraction: PropTypes.func.isRequired,
  onSortChange: PropTypes.func.isRequired,
};

export default HostsTab;

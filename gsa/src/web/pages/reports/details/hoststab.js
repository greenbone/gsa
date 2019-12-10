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

import HostsTable from './hoststable';
import ReportEntitiesContainer from './reportentitiescontainer';

import PropTypes from 'web/utils/proptypes';

import {
  makeCompareIp,
  makeCompareNumber,
  makeCompareSeverity,
  makeCompareString,
} from 'web/utils/sort';

const hostsSortFunctions = {
  ip: makeCompareIp('ip'),
  hostname: makeCompareString('hostname'),
  portsCount: makeCompareNumber(entity => entity.portCount),
  appsCount: makeCompareNumber(entity => entity.appsCount),
  distance: makeCompareNumber(entity => entity.details.distance),
  os: makeCompareString(entity => entity.details.best_os_cpe),
  high: makeCompareNumber(entity => entity.result_counts.hole),
  medium: makeCompareNumber(entity => entity.result_counts.warning),
  low: makeCompareNumber(entity => entity.result_counts.info),
  log: makeCompareNumber(entity => entity.result_counts.log),
  false_positive: makeCompareNumber(
    entity => entity.result_counts.false_positive,
  ),
  total: makeCompareNumber(entity => entity.result_counts.total),
  severity: makeCompareSeverity(),
};

const HostsTab = ({
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

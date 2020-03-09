/* Copyright (C) 2019-2020 Greenbone Networks GmbH
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

import ClosedCvesTable from './closedcvestable';
import ReportEntitiesContainer from './reportentitiescontainer';

import PropTypes from 'web/utils/proptypes';

import {
  makeCompareIp,
  makeCompareString,
  makeCompareSeverity,
} from 'web/utils/sort';

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

/* Copyright (C) 2017-2020 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
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
};

const OperatingSystemsTab = ({
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

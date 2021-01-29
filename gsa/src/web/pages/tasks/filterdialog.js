/* Copyright (C) 2016-2021 Greenbone Networks GmbH
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

import {_l, _} from 'gmp/locale/lang';

import Layout from 'web/components/layout/layout';

import compose from 'web/utils/compose';
import withCapabilities from 'web/utils/withCapabilities';

/* eslint-disable max-len */

import BooleanFilterGroup from 'web/components/powerfilter/booleanfiltergroup';
import CreateNamedFilterGroup from 'web/components/powerfilter/createnamedfiltergroup';
import FilterStringGroup from 'web/components/powerfilter/filterstringgroup';
import FirstResultGroup from 'web/components/powerfilter/firstresultgroup';
import MinQodGroup from 'web/components/powerfilter/minqodgroup';
import ResultsPerPageGroup from 'web/components/powerfilter/resultsperpagegroup';
import SortByGroup from 'web/components/powerfilter/sortbygroup';
import FilterDialogPropTypes from 'web/components/powerfilter/dialogproptypes';
import withFilterDialog from 'web/components/powerfilter/withFilterDialog';
import TaskTrendGroup from 'web/components/powerfilter/tasktrendgroup';
import SeverityValuesGroup from 'web/components/powerfilter/severityvaluesgroup';
import FilterSearchGroup from 'web/components/powerfilter/filtersearchgroup';

/* eslint-enable */

const SORT_FIELDS = [
  {
    name: 'name',
    displayName: _l('Name'),
  },
  {
    name: 'status',
    displayName: _l('Status'),
  },
  {
    name: 'total',
    displayName: _l('Reports: Total'),
  },
  {
    name: 'last',
    displayName: _l('Reports: Last'),
  },
  {
    name: 'severity',
    displayName: _l('Severity'),
  },
  {
    name: 'trend',
    displayName: _l('Trend'),
  },
  {
    name: 'false_positive',
    displayName: _l('False Positive'),
  },
  {
    name: 'hosts',
    displayName: _l('Number of Hosts'),
  },
];

const TaskFilterDialogComponent = ({
  capabilities,
  filter,
  filterName,
  filterstring,
  saveNamedFilter,
  onFilterStringChange,
  onFilterValueChange,
  onSearchTermChange,
  onSortOrderChange,
  onSortByChange,
  onValueChange,
}) => {
  if (!filter) {
    return null;
  }

  return (
    <Layout flex="column">
      <FilterStringGroup
        name="filterstring"
        filter={filterstring}
        onChange={onFilterStringChange}
      />

      <BooleanFilterGroup
        name="apply_overrides"
        title={_('Apply Overrides')}
        filter={filter}
        onChange={onFilterValueChange}
      />

      <FilterSearchGroup
        name="name"
        title={_('Task Name')}
        filter={filter}
        onChange={onSearchTermChange}
      />

      <SeverityValuesGroup
        name="severity"
        title={_('Severity of Last Report')}
        filter={filter}
        onChange={onFilterValueChange}
      />

      <MinQodGroup
        name="min_qod"
        filter={filter}
        onChange={onFilterValueChange}
      />

      <TaskTrendGroup filter={filter} onChange={onFilterValueChange} />

      <FilterSearchGroup
        name="schedule"
        title={_('Schedule')}
        filter={filter}
        onChange={onSearchTermChange}
      />

      <FilterSearchGroup
        name="comment"
        title={_('Comment')}
        filter={filter}
        onChange={onSearchTermChange}
      />

      <FirstResultGroup filter={filter} onChange={onFilterValueChange} />

      <ResultsPerPageGroup filter={filter} onChange={onFilterValueChange} />

      <SortByGroup
        filter={filter}
        fields={SORT_FIELDS}
        onSortOrderChange={onSortOrderChange}
        onSortByChange={onSortByChange}
      />

      {capabilities.mayCreate('filter') && (
        <CreateNamedFilterGroup
          filter={filter}
          filterName={filterName}
          saveNamedFilter={saveNamedFilter}
          onValueChange={onValueChange}
        />
      )}
    </Layout>
  );
};

TaskFilterDialogComponent.propTypes = FilterDialogPropTypes;

export default compose(
  withCapabilities,
  withFilterDialog(),
)(TaskFilterDialogComponent);

// vim: set ts=2 sw=2 tw=80:

/* Copyright (C) 2017-2021 Greenbone Networks GmbH
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

import CreateNamedFilterGroup from 'web/components/powerfilter/createnamedfiltergroup';
import FilterStringGroup from 'web/components/powerfilter/filterstringgroup';
import FirstResultGroup from 'web/components/powerfilter/firstresultgroup';
import ResultsPerPageGroup from 'web/components/powerfilter/resultsperpagegroup';
import SortByGroup from 'web/components/powerfilter/sortbygroup';
import FilterDialogPropTypes from 'web/components/powerfilter/dialogproptypes';
import withFilterDialog from 'web/components/powerfilter/withFilterDialog';
import FilterSearchGroup from 'web/components/powerfilter/filtersearchgroup';
import BooleanFilterGroup from 'web/components/powerfilter/booleanfiltergroup';

const SORT_FIELDS = [
  {
    name: 'text',
    displayName: _l('Text'),
  },
  {
    name: 'nvt',
    displayName: _l('Nvt'),
  },
  {
    name: 'hosts',
    displayName: _l('Hosts'),
  },
  {
    name: 'port',
    displayName: _l('Location'),
  },
  {
    name: 'severity',
    displayName: _l('From'),
  },
  {
    name: 'newSeverity',
    displayName: _l('To'),
  },
  {
    name: 'active',
    displayName: _l('Active'),
  },
];

const OverridesFilterDialogComponent = ({
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
        name="active"
        title={_('Active')}
        filter={filter}
        onChange={onFilterValueChange}
      />

      <FilterSearchGroup
        name="text"
        title={_('Override Text')}
        filter={filter}
        onChange={onSearchTermChange}
      />

      <FilterSearchGroup
        name="task_name"
        title={_('Task Name')}
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

OverridesFilterDialogComponent.propTypes = FilterDialogPropTypes;

export default compose(
  withCapabilities,
  withFilterDialog(),
)(OverridesFilterDialogComponent);

// vim: set ts=2 sw=2 tw=80:

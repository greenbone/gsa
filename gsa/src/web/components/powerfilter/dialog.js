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

import withCapabilities from 'web/utils/withCapabilities';

import Layout from 'web/components/layout/layout';

import withFilterDialog from 'web/components/powerfilter/withFilterDialog';

import compose from 'web/utils/compose';

import CreateNamedFilterGroup from './createnamedfiltergroup';
import FilterStringGroup from './filterstringgroup';
import FirstResultGroup from './firstresultgroup';
import ResultsPerPageGroup from './resultsperpagegroup';
import SortByGroup from './sortbygroup';

import DefaultFilterDialogPropTypes from './dialogproptypes';

export const DefaultFilterDialog = ({
  capabilities,
  createFilterType,
  filter,
  filterName,
  filterstring,
  saveNamedFilter,
  sortFields,
  onFilterCreated,
  onFilterStringChange,
  onFilterValueChange,
  onSaveNamedFilterChange,
  onSortByChange,
  onSortOrderChange,
  onValueChange,
}) => (
  <Layout flex="column">
    <FilterStringGroup filter={filterstring} onChange={onFilterStringChange} />
    <FirstResultGroup filter={filter} onChange={onFilterValueChange} />
    <ResultsPerPageGroup filter={filter} onChange={onFilterValueChange} />
    <SortByGroup
      fields={sortFields}
      filter={filter}
      onSortByChange={onSortByChange}
      onSortOrderChange={onSortOrderChange}
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

DefaultFilterDialog.propTypes = DefaultFilterDialogPropTypes;

export const createFilterDialog = options => {
  return compose(
    withCapabilities,
    withFilterDialog(options),
  )(DefaultFilterDialog);
};

export {DefaultFilterDialogPropTypes};

export default withCapabilities(DefaultFilterDialog);

// vim: set ts=2 sw=2 tw=80:

/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2016 - 2017 Greenbone Networks GmbH
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

import Layout from '../layout/layout.js';

import FilterStringGroup from './filterstringgroup.js';
import FirstResultGroup from './firstresultgroup.js';
import ResultsPerPageGroup from './resultsperpagegroup.js';
import SortByGroup from './sortbygroup.js';

import withFilterDialogNew from './withFilterDialog.js';
import DefaultFilterDialogPropTypes from './dialogproptypes.js';

export const DefaultFilterDialog = ({
  filter,
  filterstring,
  sortFields,
  onFilterStringChange,
  onFilterValueChange,
  onSortByChange,
  onSortOrderChange,
}) => (
  <Layout flex="column">
    <FilterStringGroup
      filter={filterstring}
      onChange={onFilterStringChange}/>
    <FirstResultGroup
      filter={filter}
      onChange={onFilterValueChange}/>
    <ResultsPerPageGroup
      filter={filter}
      onChange={onFilterValueChange}/>
    <SortByGroup
      fields={sortFields}
      filter={filter}
      onSortByChange={onSortByChange}
      onSortOrderChange={onSortOrderChange}/>
  </Layout>
);

DefaultFilterDialog.propTypes = DefaultFilterDialogPropTypes;

export const withFilterDialog = (FilterDialogComponent, options = {}) => {
  return withFilterDialogNew(options)(FilterDialogComponent);
};

export const createFilterDialog = options => {
  return withFilterDialog(DefaultFilterDialog, options);
};

export {DefaultFilterDialogPropTypes};

export default DefaultFilterDialog;

// vim: set ts=2 sw=2 tw=80:

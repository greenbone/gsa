/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2016 Greenbone Networks GmbH
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

import  _ from '../../locale.js';

import Layout from '../layout.js';

import ApplyOverridesGroup from '../powerfilter/applyoverridesgroup.js';
import FilterStringGroup from '../powerfilter/filterstringgroup.js';
import FirstResultGroup from '../powerfilter/firstresultgroup.js';
import MinQodGroup from '../powerfilter/minqodgroup.js';
import ResultsPerPageGroup from '../powerfilter/resultsperpagegroup.js';
import SortByGroup from '../powerfilter/sortbygroup.js';
import {withFilterDialog} from '../powerfilter/dialog.js';

const SORT_FIELDS = [
  ['name', _('Name')],
  ['status', _('Status')],
  ['total', _('Reports: Total')],
  ['last', _('Reports: Last')],
  ['severity', _('Severity')],
  ['trend', _('Trend')],
];

const TaskFilterDialogComponent = props => {

  let {filter, filterstring, onFilterStringChange, onFilterValueChange,
    onSortOrderChange, onSortByChange} = props;

  if (!filter) {
    return null;
  }

  return (
    <Layout flex="column">
      <FilterStringGroup
        name="filterstring"
        filter={filterstring}
        onChange={onFilterStringChange}/>

      <ApplyOverridesGroup
        filter={filter}
        onChange={onFilterValueChange}/>

      <MinQodGroup name="min_qod"
        filter={filter}
        onChange={onFilterValueChange}/>

      <FirstResultGroup
        filter={filter}
        onChange={onFilterValueChange}/>

      <ResultsPerPageGroup
        filter={filter}
        onChange={onFilterValueChange}/>

      <SortByGroup
        filter={filter}
        fields={SORT_FIELDS}
        onSortOrderChange={onSortOrderChange}
        onSortByChange={onSortByChange}/>
    </Layout>
  );
};

TaskFilterDialogComponent.propTypes = {
  filter: React.PropTypes.object,
  filterstring: React.PropTypes.string,
  onSortByChange: React.PropTypes.func,
  onSortOrderChange: React.PropTypes.func,
  onFilterValueChange: React.PropTypes.func,
  onFilterStringChange: React.PropTypes.func,
};

export const TaskFilterDialog = withFilterDialog(TaskFilterDialogComponent);

export default TaskFilterDialog;

// vim: set ts=2 sw=2 tw=80:

/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2017 Greenbone Networks GmbH
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

import  _ from 'gmp/locale.js';

import Layout from '../../components/layout/layout.js';

import ApplyOverridesGroup from '../../components/powerfilter/applyoverridesgroup.js'; // eslint-disable-line max-len
import FilterStringGroup from '../../components/powerfilter/filterstringgroup.js';
import FirstResultGroup from '../../components/powerfilter/firstresultgroup.js';
import MinQodGroup from '../../components/powerfilter/minqodgroup.js';
import ResultsPerPageGroup from '../../components/powerfilter/resultsperpagegroup.js'; // eslint-disable-line max-len
import SortByGroup from '../../components/powerfilter/sortbygroup.js';
import {
  DefaultFilterDialogPropTypes,
  withFilterDialog,
} from '../../components/powerfilter/dialog.js';

const SORT_FIELDS = [
  ['date', _('Date')],
  ['status', _('Status')],
  ['task', _('Task')],
  ['severity', _('Severity')],
  ['high', _('Scan Results: High')],
  ['medium', _('Scan Results: Medium')],
  ['low', _('Scan Results: Low')],
  ['log', _('Scan Results: Log')],
  ['false_positive', _('Scan Results: False Positive')],
];

const ReportFilterDialogComponent = ({
    filter,
    filterstring,
    onFilterStringChange,
    onFilterValueChange,
    onSortByChange,
    onSortOrderChange,
  }) => {

  if (!filter) {
    return null;
  }

  return (
    <Layout flex="column">

      <FilterStringGroup name="filterstring"
        filter={filterstring}
        onChange={onFilterStringChange}/>

      <ApplyOverridesGroup filter={filter} onChange={onFilterValueChange}/>

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

ReportFilterDialogComponent.propTypes = DefaultFilterDialogPropTypes;

export default withFilterDialog(ReportFilterDialogComponent);

// vim: set ts=2 sw=2 tw=80:

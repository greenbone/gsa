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

import _ from 'gmp/locale.js';

import Layout from '../../components/layout/layout.js';

/* eslint-disable max-len */

import ApplyOverridesGroup from '../../components/powerfilter/applyoverridesgroup.js';
import FilterStringGroup from '../../components/powerfilter/filterstringgroup.js';
import FirstResultGroup from '../../components/powerfilter/firstresultgroup.js';
import MinQodGroup from '../../components/powerfilter/minqodgroup.js';
import ResultsPerPageGroup from '../../components/powerfilter/resultsperpagegroup.js';
import SortByGroup from '../../components/powerfilter/sortbygroup.js';
import SeverityLevelsGroup from '../../components/powerfilter/severitylevelsgroup.js';
import withFilterDialog from '../../components/powerfilter/withFilterDialog.js';
import FilterDialogPropTypes from '../../components/powerfilter/dialogproptypes.js';
import AutoFpGroup from '../../components/powerfilter/autofpgroup.js';

/* eslint-enable */

const SORT_FIELDS = [
  ['vulnerability', _('Vulnerability')],
  ['solution_type', _('Solution type')],
  ['severity', _('Severity')],
  ['qod', _('QoD')],
  ['host', _('Host')],
  ['location', _('Location')],
  ['created', _('Created')],
];

const ResultsFilterDialogComponent = ({
  filter,
  filterstring,
  onFilterStringChange,
  onFilterValueChange,
  onSortByChange,
  onSortOrderChange,
}) => (
  <Layout flex="column">

    <FilterStringGroup
      name="filterstring"
      filter={filterstring}
      onChange={onFilterStringChange}/>

    <ApplyOverridesGroup
      filter={filter}
      onChange={onFilterValueChange}/>

    <AutoFpGroup
      filter={filter}
      onChange={onFilterValueChange}
    />

    <SeverityLevelsGroup
      filter={filter}
      onChange={onFilterValueChange}
    />

    <MinQodGroup
      name="min_qod"
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

ResultsFilterDialogComponent.propTypes = FilterDialogPropTypes;

export default withFilterDialog()(ResultsFilterDialogComponent);

// vim: set ts=2 sw=2 tw=80:

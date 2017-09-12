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

import _ from 'gmp/locale.js';

import FormGroup from '../../components/form/formgroup.js';
import Checkbox from '../../components/form/checkbox.js';

import Layout from '../../components/layout/layout.js';

/* eslint-disable max-len */

import ApplyOverridesGroup from '../../components/powerfilter/applyoverridesgroup.js';
import AutoFpGroup from '../../components/powerfilter/autofpgroup.js';
import FilterStringGroup from '../../components/powerfilter/filterstringgroup.js';
import FirstResultGroup from '../../components/powerfilter/firstresultgroup.js';
import MinQodGroup from '../../components/powerfilter/minqodgroup.js';
import ResultsPerPageGroup from '../../components/powerfilter/resultsperpagegroup.js';
import SortByGroup from '../../components/powerfilter/sortbygroup.js';
import withFilterDialog from '../../components/powerfilter/withFilterDialog.js';
import FilterDialogPropTypes from '../../components/powerfilter/dialogproptypes.js';
import SeverityLevelsGroup from '../../components/powerfilter/severitylevelsgroup.js';

/* eslint-enable */

const SORT_FIELDS = [
  ['vulnerability', _('Vulnerability')],
  ['solution_type', _('Solution Type')],
  ['severity', _('Severity')],
  ['qod', _('Quality of Detection')],
  ['host', _('Host')],
  ['location', _('Location')],
];

const FilterDialog = ({
  filter,
  filterstring,
  onFilterStringChange,
  onFilterValueChange,
  onSortByChange,
  onSortOrderChange,
}) => {
  const notes = filter.get('notes');
  const overrides = filter.get('overrides');
  const result_hosts_only = filter.get('result_hosts_only');
  return (
    <Layout flex="column">

      <FilterStringGroup
        name="filterstring"
        filter={filterstring}
        onChange={onFilterStringChange}
      />

      <ApplyOverridesGroup
        filter={filter}
        onChange={onFilterValueChange}
      />

      <AutoFpGroup
        filter={filter}
        onChange={onFilterValueChange}
      />

      <FormGroup title={_('Show Notes')}>
        <Checkbox
          name="notes"
          checkedValue={1}
          unCheckedValue={0}
          checked={notes === 1}
          onChange={onFilterValueChange}/>
      </FormGroup>

      <FormGroup title={_('Show Overrides')}>
        <Checkbox
          name="overrides"
          checkedValue={1}
          unCheckedValue={0}
          checked={overrides === 1}
          onChange={onFilterValueChange}/>
      </FormGroup>

      <FormGroup title={_('Only show hosts that have results')}>
        <Checkbox
          name="result_hosts_only"
          checkedValue={1}
          unCheckedValue={0}
          checked={result_hosts_only === 1}
          onChange={onFilterValueChange}/>
      </FormGroup>

      <MinQodGroup
        name="min_qod"
        filter={filter}
        onChange={onFilterValueChange}
      />

      <SeverityLevelsGroup
        filter={filter}
        onChange={onFilterValueChange}
      />

      <FirstResultGroup
        filter={filter}
        onChange={onFilterValueChange}
      />

      <ResultsPerPageGroup
        filter={filter}
        onChange={onFilterValueChange}
      />

      <SortByGroup
        filter={filter}
        fields={SORT_FIELDS}
        onSortOrderChange={onSortOrderChange}
        onSortByChange={onSortByChange}
      />
    </Layout>
  );
};

FilterDialog.propTypes = FilterDialogPropTypes;

export default withFilterDialog()(FilterDialog);

// vim: set ts=2 sw=2 tw=80:

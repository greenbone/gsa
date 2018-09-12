/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2017 - 2018 Greenbone Networks GmbH
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

import _ from 'gmp/locale';

import FormGroup from 'web/components/form/formgroup';
import Checkbox from 'web/components/form/checkbox';

import Layout from 'web/components/layout/layout';

/* eslint-disable max-len */

import ApplyOverridesGroup from 'web/components/powerfilter/applyoverridesgroup';
import AutoFpGroup from 'web/components/powerfilter/autofpgroup';
import FilterStringGroup from 'web/components/powerfilter/filterstringgroup';
import FirstResultGroup from 'web/components/powerfilter/firstresultgroup';
import MinQodGroup from 'web/components/powerfilter/minqodgroup';
import ResultsPerPageGroup from 'web/components/powerfilter/resultsperpagegroup';
import withFilterDialog from 'web/components/powerfilter/withFilterDialog';
import FilterDialogPropTypes from 'web/components/powerfilter/dialogproptypes';
import SeverityLevelsGroup from 'web/components/powerfilter/severitylevelsgroup';

/* eslint-enable */

import DeltaResultsFilterGroup from './deltaresultsfiltergroup';

const FilterDialog = ({
  delta = false,
  filter,
  filterstring,
  onFilterStringChange,
  onFilterValueChange,
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

      {delta &&
        <DeltaResultsFilterGroup
          filter={filter}
          onChange={onFilterValueChange}
        />
      }

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
          onChange={onFilterValueChange}
        />
      </FormGroup>

      <FormGroup title={_('Show Overrides')}>
        <Checkbox
          name="overrides"
          checkedValue={1}
          unCheckedValue={0}
          checked={overrides === 1}
          onChange={onFilterValueChange}
        />
      </FormGroup>

      <FormGroup title={_('Only show hosts that have results')}>
        <Checkbox
          name="result_hosts_only"
          checkedValue={1}
          unCheckedValue={0}
          checked={result_hosts_only === 1}
          onChange={onFilterValueChange}
        />
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

    </Layout>
  );
};

FilterDialog.propTypes = FilterDialogPropTypes;

export default withFilterDialog()(FilterDialog);

// vim: set ts=2 sw=2 tw=80:

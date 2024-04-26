/* Copyright (C) 2024 Greenbone AG
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
import useCapabilities from 'web/utils/useCapabilities';

/* eslint-disable max-len */

import CreateNamedFilterGroup from 'web/components/powerfilter/createnamedfiltergroup';
import FilterStringGroup from 'web/components/powerfilter/filterstringgroup';
import FirstResultGroup from 'web/components/powerfilter/firstresultgroup';
import MinQodGroup from 'web/components/powerfilter/minqodgroup';
import ResultsPerPageGroup from 'web/components/powerfilter/resultsperpagegroup';
import SortByGroup from 'web/components/powerfilter/sortbygroup';
import withFilterDialog from 'web/components/powerfilter/withFilterDialog';
import FilterDialogPropTypes from 'web/components/powerfilter/dialogproptypes';
import ComplianceLevelFilterGroup from 'web/components/powerfilter/compliancelevelsgroup';
import FilterSearchGroup from 'web/components/powerfilter/filtersearchgroup';

/* eslint-enable */

const SORT_FIELDS = [
  {
    name: 'date',
    displayName: _l('Date'),
  },
  {
    name: 'status',
    displayName: _l('Status'),
  },
  {
    name: 'task',
    displayName: _l('Task'),
  },
  {
    name: 'compliant',
    displayName: _l('Compliant'),
  },
  {
    name: 'compliance_yes',
    displayName: _l('Compliance: Yes'),
  },
  {
    name: 'compliance_no',
    displayName: _l('Compliance: No'),
  },
  {
    name: 'compliance_incomplete',
    displayName: _l('Compliance: Incomplete'),
  },
];

const AuditReportFilterDialogComponent = ({
  filter,
  filterName,
  filterstring,
  onFilterChange,
  saveNamedFilter,
  onFilterStringChange,
  onFilterValueChange,
  onSearchTermChange,
  onSortByChange,
  onSortOrderChange,
  onValueChange,
}) => {
  const handleRemoveCompliance = () =>
    onFilterChange(filter.delete('report_compliance_levels'));

  const capabilities = useCapabilities();

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

      <ComplianceLevelFilterGroup
        name="compliant"
        filter={filter}
        onChange={onFilterValueChange}
        onRemove={handleRemoveCompliance}
      />

      <MinQodGroup
        name="min_qod"
        filter={filter}
        onChange={onFilterValueChange}
      />

      <FilterSearchGroup
        name="task"
        title={_('From Task (name)')}
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

AuditReportFilterDialogComponent.propTypes = FilterDialogPropTypes;

export default compose(withFilterDialog())(AuditReportFilterDialogComponent);

// vim: set ts=2 sw=2 tw=80:

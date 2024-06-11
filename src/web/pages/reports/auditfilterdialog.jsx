/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
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

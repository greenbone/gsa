/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import Layout from 'web/components/layout/layout';

import useCapabilities from 'web/hooks/useCapabilities';

import useTranslation from 'web/hooks/useTranslation';

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
  const [_] = useTranslation();
  const capabilities = useCapabilities();
  const handleRemoveCompliance = () =>
    onFilterChange(filter.delete('report_compliance_levels'));
  const SORT_FIELDS = [
    {
      name: 'date',
      displayName: _('Date'),
    },
    {
      name: 'status',
      displayName: _('Status'),
    },
    {
      name: 'task',
      displayName: _('Task'),
    },
    {
      name: 'compliant',
      displayName: _('Compliant'),
    },
    {
      name: 'compliance_yes',
      displayName: _('Compliance: Yes'),
    },
    {
      name: 'compliance_no',
      displayName: _('Compliance: No'),
    },
    {
      name: 'compliance_incomplete',
      displayName: _('Compliance: Incomplete'),
    },
  ];
  
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

export default withFilterDialog()(AuditReportFilterDialogComponent);
/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import Layout from 'web/components/layout/Layout';
import ComplianceLevelFilterGroup from 'web/components/powerfilter/ComplianceLevelsGroup';
import CreateNamedFilterGroup from 'web/components/powerfilter/CreateNamedFilterGroup';
import FilterDialogPropTypes from 'web/components/powerfilter/DialogPropTypes';
import FilterSearchGroup from 'web/components/powerfilter/FilterSearchGroup';
import FilterStringGroup from 'web/components/powerfilter/FilterStringGroup';
import FirstResultGroup from 'web/components/powerfilter/FirstResultGroup';
import MinQodGroup from 'web/components/powerfilter/MinQodGroup';
import ResultsPerPageGroup from 'web/components/powerfilter/ResultsPerPageGroup';
import SortByGroup from 'web/components/powerfilter/SortByGroup';
import withFilterDialog from 'web/components/powerfilter/withFilterDialog';
import useCapabilities from 'web/hooks/useCapabilities';
import useTranslation from 'web/hooks/useTranslation';

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
        filter={filterstring}
        name="filterstring"
        onChange={onFilterStringChange}
      />

      <ComplianceLevelFilterGroup
        filter={filter}
        name="compliant"
        onChange={onFilterValueChange}
        onRemove={handleRemoveCompliance}
      />

      <MinQodGroup
        filter={filter}
        name="min_qod"
        onChange={onFilterValueChange}
      />

      <FilterSearchGroup
        filter={filter}
        name="task"
        title={_('From Task (name)')}
        onChange={onSearchTermChange}
      />

      <FirstResultGroup filter={filter} onChange={onFilterValueChange} />

      <ResultsPerPageGroup filter={filter} onChange={onFilterValueChange} />

      <SortByGroup
        fields={SORT_FIELDS}
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
};

AuditReportFilterDialogComponent.propTypes = FilterDialogPropTypes;

export default withFilterDialog()(AuditReportFilterDialogComponent);

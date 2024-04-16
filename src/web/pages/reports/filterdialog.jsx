/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import PropTypes from 'web/utils/proptypes';

import BooleanFilterGroup from 'web/components/powerfilter/booleanfiltergroup';
import CreateNamedFilterGroup from 'web/components/powerfilter/createnamedfiltergroup';
import FilterStringGroup from 'web/components/powerfilter/filterstringgroup';
import FirstResultGroup from 'web/components/powerfilter/firstresultgroup';
import MinQodGroup from 'web/components/powerfilter/minqodgroup';
import ResultsPerPageGroup from 'web/components/powerfilter/resultsperpagegroup';
import SortByGroup from 'web/components/powerfilter/sortbygroup';
import SeverityValuesGroup from 'web/components/powerfilter/severityvaluesgroup';
import FilterSearchGroup from 'web/components/powerfilter/filtersearchgroup';
import FilterDialog from 'web/components/powerfilter/filterdialog';

import useFilterDialog from 'web/components/powerfilter/useFilterDialog';
import useFilterDialogSave from 'web/components/powerfilter/useFilterDialogSave';

import useCapabilities from 'web/utils/useCapabilities';
import useTranslation from 'web/hooks/useTranslation';

const ReportFilterDialogComponent = ({
  filter: initialFilter,
  onCloseClick,
  onClose = onCloseClick,
  onFilterChanged,
  onFilterCreated,
}) => {
  const capabilities = useCapabilities();
  const [_] = useTranslation();
  const filterDialogProps = useFilterDialog(initialFilter);
  const [handleSave] = useFilterDialogSave(
    'report',
    {
      onClose,
      onFilterChanged,
      onFilterCreated,
    },
    filterDialogProps,
  );

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
      name: 'severity',
      displayName: _('Severity'),
    },
    {
      name: 'high',
      displayName: _('Scan Results: High'),
    },
    {
      name: 'medium',
      displayName: _('Scan Results: Medium'),
    },
    {
      name: 'low',
      displayName: _('Scan Results: Low'),
    },
    {
      name: 'log',
      displayName: _('Scan Results: Log'),
    },
    {
      name: 'false_positive',
      displayName: _('Scan Results: False Positive'),
    },
  ];

  const {
    filter,
    filterName,
    filterString,
    saveNamedFilter,
    onFilterStringChange,
    onFilterValueChange,
    onSearchTermChange,
    onSortByChange,
    onSortOrderChange,
    onValueChange,
  } = filterDialogProps;
  return (
    <FilterDialog onClose={onClose} onSave={handleSave}>
      <FilterStringGroup
        name="filterstring"
        filter={filterString}
        onChange={onFilterStringChange}
      />

      <BooleanFilterGroup
        name="apply_overrides"
        title={_('Apply Overrides')}
        filter={filter}
        onChange={onFilterValueChange}
      />

      <SeverityValuesGroup
        name="severity"
        title={_('Highest Severity from Results')}
        filter={filter}
        onChange={onFilterValueChange}
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
    </FilterDialog>
  );
};

ReportFilterDialogComponent.propTypes = {
  filter: PropTypes.filter,
  onClose: PropTypes.func,
  onCloseClick: PropTypes.func, // should be removed in future
  onFilterChanged: PropTypes.func,
  onFilterCreated: PropTypes.func,
};

export default ReportFilterDialogComponent;

// vim: set ts=2 sw=2 tw=80:

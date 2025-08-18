/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import CreateNamedFilterGroup from 'web/components/powerfilter/CreateNamedFilterGroup';
import FilterDialog from 'web/components/powerfilter/FilterDialog';
import FilterStringGroup from 'web/components/powerfilter/FilterStringGroup';
import FirstResultGroup from 'web/components/powerfilter/FirstResultGroup';
import ResultsPerPageGroup from 'web/components/powerfilter/ResultsPerPageGroup';
import SeverityValuesGroup from 'web/components/powerfilter/SeverityValuesGroup';
import SolutionTypeGroup from 'web/components/powerfilter/SolutionTypeGroup';
import SortByGroup from 'web/components/powerfilter/SortByGroup';
import TicketStatusFilterGroup from 'web/components/powerfilter/TicketStatusGroup';
import useFilterDialog from 'web/components/powerfilter/useFilterDialog';
import useFilterDialogSave from 'web/components/powerfilter/useFilterDialogSave';
import useCapabilities from 'web/hooks/useCapabilities';
import useTranslation from 'web/hooks/useTranslation';
import PropTypes from 'web/utils/PropTypes';

const TicketsFilterDialogComponent = ({
  filter: initialFilter,
  onClose,
  onFilterChanged,
  onFilterCreated,
}) => {
  const capabilities = useCapabilities();
  const [_] = useTranslation();
  const filterDialogProps = useFilterDialog(initialFilter);
  const [handleSave] = useFilterDialogSave(
    'ticket',
    {
      onClose,
      onFilterChanged,
      onFilterCreated,
    },
    filterDialogProps,
  );
  const SORT_FIELDS = [
    {
      name: 'name',
      displayName: _('Vulnerability'),
    },
    {
      name: 'severity',
      displayName: _('Severity'),
    },
    {
      name: 'host',
      displayName: _('Host'),
    },
    {
      name: 'solution_type',
      displayName: _('Solution Type'),
    },
    {
      name: 'username',
      displayName: _('Assigned User'),
    },
    {
      name: 'modified',
      displayName: _('Modification Time'),
    },
    {
      name: 'status',
      displayName: _('Status'),
    },
  ];

  const {
    filter,
    filterString,
    filterName,
    saveNamedFilter,
    onFilterStringChange,
    onFilterValueChange,
    onFilterChange,
    onSortByChange,
    onSortOrderChange,
    onValueChange,
  } = filterDialogProps;
  return (
    <FilterDialog onClose={onClose} onSave={handleSave}>
      <FilterStringGroup
        filter={filterString}
        name="filterString"
        onChange={onFilterStringChange}
      />

      <SolutionTypeGroup filter={filter} onChange={onFilterChange} />

      <SeverityValuesGroup
        filter={filter}
        name="severity"
        title={_('Severity')}
        onChange={onFilterValueChange}
      />

      <TicketStatusFilterGroup filter={filter} onChange={onFilterValueChange} />

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
    </FilterDialog>
  );
};

TicketsFilterDialogComponent.propTypes = {
  filter: PropTypes.filter,
  onClose: PropTypes.func,
  onFilterChanged: PropTypes.func,
  onFilterCreated: PropTypes.func,
};

export default TicketsFilterDialogComponent;

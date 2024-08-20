/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import PropTypes from 'web/utils/proptypes';

import CreateNamedFilterGroup from 'web/components/powerfilter/createnamedfiltergroup';
import FilterStringGroup from 'web/components/powerfilter/filterstringgroup';
import FirstResultGroup from 'web/components/powerfilter/firstresultgroup';
import ResultsPerPageGroup from 'web/components/powerfilter/resultsperpagegroup';
import SortByGroup from 'web/components/powerfilter/sortbygroup';
import TicketStatusFilterGroup from 'web/components/powerfilter/ticketstatusgroup';
import SeverityValuesGroup from 'web/components/powerfilter/severityvaluesgroup';
import SolutionTypeGroup from 'web/components/powerfilter/solutiontypegroup';
import FilterDialog from 'web/components/powerfilter/filterdialog';

import useFilterDialog from 'web/components/powerfilter/useFilterDialog';
import useFilterDialogSave from 'web/components/powerfilter/useFilterDialogSave';

import useCapabilities from 'web/utils/useCapabilities';
import useTranslation from 'web/hooks/useTranslation';

const TicketsFilterDialogComponent = ({
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
        name="filterstring"
        filter={filterString}
        onChange={onFilterStringChange}
      />

      <SolutionTypeGroup filter={filter} onChange={onFilterChange} />

      <SeverityValuesGroup
        name="severity"
        title={_('Severity')}
        filter={filter}
        onChange={onFilterValueChange}
      />

      <TicketStatusFilterGroup filter={filter} onChange={onFilterValueChange} />

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

TicketsFilterDialogComponent.propTypes = {
  filter: PropTypes.filter,
  onClose: PropTypes.func,
  onCloseClick: PropTypes.func, // should be removed in future
  onFilterChanged: PropTypes.func,
  onFilterCreated: PropTypes.func,
};

export default TicketsFilterDialogComponent;

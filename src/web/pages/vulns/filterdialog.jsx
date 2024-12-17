/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import CreateNamedFilterGroup from 'web/components/powerfilter/createnamedfiltergroup';
import FilterDialog from 'web/components/powerfilter/filterdialog';
import FilterSearchGroup from 'web/components/powerfilter/filtersearchgroup';
import FilterStringGroup from 'web/components/powerfilter/filterstringgroup';
import FirstResultGroup from 'web/components/powerfilter/firstresultgroup';
import MinQodGroup from 'web/components/powerfilter/minqodgroup';
import ResultsPerPageGroup from 'web/components/powerfilter/resultsperpagegroup';
import SeverityValuesGroup from 'web/components/powerfilter/severityvaluesgroup';
import SortByGroup from 'web/components/powerfilter/sortbygroup';
import useFilterDialog from 'web/components/powerfilter/useFilterDialog';
import useFilterDialogSave from 'web/components/powerfilter/useFilterDialogSave';
import useCapabilities from 'web/hooks/useCapabilities';
import useTranslation from 'web/hooks/useTranslation';
import PropTypes from 'web/utils/proptypes';

const VulnsFilterDialogComponent = ({
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
    'vulnerability',
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
      displayName: _('Name'),
    },
    {
      name: 'oldest',
      displayName: _('Oldest Result'),
    },
    {
      name: 'newest',
      displayName: _('Newest Result'),
    },
    {
      name: 'severity',
      displayName: _('Severity'),
    },
    {
      name: 'qod',
      displayName: _('QoD'),
    },
    {
      name: 'results',
      displayName: _('Results'),
    },
    {
      name: 'hosts',
      displayName: _('Hosts'),
    },
  ];
  const {
    filter,
    filterName,
    filterString,
    saveNamedFilter,
    onFilterValueChange,
    onFilterStringChange,
    onSearchTermChange,
    onSortByChange,
    onSortOrderChange,
    onValueChange,
  } = filterDialogProps;
  return (
    <FilterDialog onClose={onClose} onSave={handleSave}>
      <FilterStringGroup
        filter={filterString}
        name="filterstring"
        onChange={onFilterStringChange}
      />

      <SeverityValuesGroup
        filter={filter}
        name="severity"
        title={_('Severity')}
        onChange={onFilterValueChange}
      />

      <MinQodGroup
        filter={filter}
        name="min_qod"
        onChange={onFilterValueChange}
      />

      <FilterSearchGroup
        filter={filter}
        name="name"
        title={_('Name')}
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
    </FilterDialog>
  );
};

VulnsFilterDialogComponent.propTypes = {
  filter: PropTypes.filter,
  onClose: PropTypes.func,
  onCloseClick: PropTypes.func, // should be removed in future
  onFilterChanged: PropTypes.func,
  onFilterCreated: PropTypes.func,
};

export default VulnsFilterDialogComponent;

// vim: set ts=2 sw=2 tw=80:

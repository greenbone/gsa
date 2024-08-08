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
import FilterSearchGroup from 'web/components/powerfilter/filtersearchgroup';
import BooleanFilterGroup from 'web/components/powerfilter/booleanfiltergroup';

import useTranslation from 'web/hooks/useTranslation';
import useCapabilities from 'web/hooks/useCapabilities';
import FilterDialog from 'web/components/powerfilter/filterdialog';

import useFilterDialog from 'web/components/powerfilter/useFilterDialog';
import useFilterDialogSave from 'web/components/powerfilter/useFilterDialogSave';

const OverridesFilterDialogComponent = ({
  filter: initialFilter,
  onCloseClick,
  onClose = onCloseClick,
  onFilterChanged,
  onFilterCreated,
}) => {
  const [_] = useTranslation();
  const capabilities = useCapabilities();
  const filterDialogProps = useFilterDialog(initialFilter);
  const [handleSave] = useFilterDialogSave(
    'override',
    {
      onClose,
      onFilterChanged,
      onFilterCreated,
    },
    filterDialogProps,
  );

  const SORT_FIELDS = [
    {
      name: 'text',
      displayName: _('Text'),
    },
    {
      name: 'nvt',
      displayName: _('Nvt'),
    },
    {
      name: 'hosts',
      displayName: _('Hosts'),
    },
    {
      name: 'port',
      displayName: _('Location'),
    },
    {
      name: 'severity',
      displayName: _('From'),
    },
    {
      name: 'newSeverity',
      displayName: _('To'),
    },
    {
      name: 'active',
      displayName: _('Active'),
    },
  ];

  const {
    filterString,
    filter,
    filterName,
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
        name="active"
        title={_('Active')}
        filter={filter}
        onChange={onFilterValueChange}
      />

      <FilterSearchGroup
        name="text"
        title={_('Override Text')}
        filter={filter}
        onChange={onSearchTermChange}
      />

      <FilterSearchGroup
        name="task_name"
        title={_('Task Name')}
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

OverridesFilterDialogComponent.propTypes = {
  filter: PropTypes.filter,
  onClose: PropTypes.func,
  onCloseClick: PropTypes.func, // should be removed in future
  onFilterChanged: PropTypes.func,
  onFilterCreated: PropTypes.func,
};

export default OverridesFilterDialogComponent;

// vim: set ts=2 sw=2 tw=80:

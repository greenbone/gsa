/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import BooleanFilterGroup from 'web/components/powerfilter/booleanfiltergroup';
import CreateNamedFilterGroup from 'web/components/powerfilter/createnamedfiltergroup';
import FilterDialog from 'web/components/powerfilter/filterdialog';
import FilterSearchGroup from 'web/components/powerfilter/filtersearchgroup';
import FilterStringGroup from 'web/components/powerfilter/filterstringgroup';
import FirstResultGroup from 'web/components/powerfilter/firstresultgroup';
import ResultsPerPageGroup from 'web/components/powerfilter/resultsperpagegroup';
import SortByGroup from 'web/components/powerfilter/sortbygroup';
import useFilterDialog from 'web/components/powerfilter/useFilterDialog';
import useFilterDialogSave from 'web/components/powerfilter/useFilterDialogSave';
import useCapabilities from 'web/hooks/useCapabilities';
import useTranslation from 'web/hooks/useTranslation';
import PropTypes from 'web/utils/proptypes';

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
        filter={filterString}
        name="filterstring"
        onChange={onFilterStringChange}
      />

      <BooleanFilterGroup
        filter={filter}
        name="active"
        title={_('Active')}
        onChange={onFilterValueChange}
      />

      <FilterSearchGroup
        filter={filter}
        name="text"
        title={_('Override Text')}
        onChange={onSearchTermChange}
      />

      <FilterSearchGroup
        filter={filter}
        name="task_name"
        title={_('Task Name')}
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

OverridesFilterDialogComponent.propTypes = {
  filter: PropTypes.filter,
  onClose: PropTypes.func,
  onCloseClick: PropTypes.func, // should be removed in future
  onFilterChanged: PropTypes.func,
  onFilterCreated: PropTypes.func,
};

export default OverridesFilterDialogComponent;

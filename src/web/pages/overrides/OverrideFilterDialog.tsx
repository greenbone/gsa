/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type Filter from 'gmp/models/filter';
import BooleanFilterGroup from 'web/components/powerfilter/BooleanFilterGroup';
import CreateNamedFilterGroup from 'web/components/powerfilter/CreateNamedFilterGroup';
import FilterDialog from 'web/components/powerfilter/FilterDialog';
import FilterSearchGroup from 'web/components/powerfilter/FilterSearchGroup';
import FilterStringGroup from 'web/components/powerfilter/FilterStringGroup';
import FirstResultGroup from 'web/components/powerfilter/FirstResultGroup';
import ResultsPerPageGroup from 'web/components/powerfilter/ResultsPerPageGroup';
import SortByGroup from 'web/components/powerfilter/SortByGroup';
import useFilterDialog from 'web/components/powerfilter/useFilterDialog';
import useFilterDialogSave, {
  type UseFilterDialogSaveProps,
  type UseFilterDialogStateProps,
} from 'web/components/powerfilter/useFilterDialogSave';
import useCapabilities from 'web/hooks/useCapabilities';
import useTranslation from 'web/hooks/useTranslation';

interface OverrideFilterDialogProps extends UseFilterDialogSaveProps {
  filter?: Filter;
}

const OverrideFilterDialog = ({
  filter: initialFilter,
  onClose,
  onFilterChanged,
  onFilterCreated,
}: OverrideFilterDialogProps) => {
  const [_] = useTranslation();
  const capabilities = useCapabilities();
  const filterDialogProps =
    useFilterDialog<UseFilterDialogStateProps>(initialFilter);
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
        name="filterString"
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
          filterName={filterName}
          saveNamedFilter={saveNamedFilter}
          onValueChange={onValueChange}
        />
      )}
    </FilterDialog>
  );
};

export default OverrideFilterDialog;

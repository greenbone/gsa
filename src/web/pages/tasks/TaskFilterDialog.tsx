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
import MinQodGroup from 'web/components/powerfilter/MinQodGroup';
import ResultsPerPageGroup from 'web/components/powerfilter/ResultsPerPageGroup';
import SeverityValuesGroup from 'web/components/powerfilter/SeverityValuesGroup';
import SortByGroup from 'web/components/powerfilter/SortByGroup';
import TaskTrendGroup from 'web/components/powerfilter/TaskTrendGroup';
import useFilterDialog from 'web/components/powerfilter/useFilterDialog';
import useFilterDialogSave, {
  type UseFilterDialogSaveProps,
  type UseFilterDialogStateProps,
} from 'web/components/powerfilter/useFilterDialogSave';
import useCapabilities from 'web/hooks/useCapabilities';
import useTranslation from 'web/hooks/useTranslation';

interface TaskFilterDialogProps extends UseFilterDialogSaveProps {
  filter?: Filter;
}

const TaskFilterDialog = ({
  filter: initialFilter,
  onClose,
  onFilterChanged,
  onFilterCreated,
}: TaskFilterDialogProps) => {
  const [_] = useTranslation();
  const capabilities = useCapabilities();
  const filterDialogProps =
    useFilterDialog<UseFilterDialogStateProps>(initialFilter);
  const [handleSave] = useFilterDialogSave(
    'task',
    {
      onClose,
      onFilterChanged,
      onFilterCreated,
    },
    filterDialogProps,
  );
  const {
    filter,
    filterString,
    filterName,
    saveNamedFilter,
    handleFilterStringChange,
    handleFilterValueChange,
    handleSearchTermChange,
    handleSortByChange,
    handleSortOrderChange,
    handleChange,
  } = filterDialogProps;

  const SORT_FIELDS = [
    {
      name: 'name',
      displayName: _('Name'),
    },
    {
      name: 'status',
      displayName: _('Status'),
    },
    {
      name: 'total',
      displayName: _('Reports: Total'),
    },
    {
      name: 'last',
      displayName: _('Reports: Last'),
    },
    {
      name: 'severity',
      displayName: _('Severity'),
    },
    {
      name: 'trend',
      displayName: _('Trend'),
    },
    {
      name: 'false_positive',
      displayName: _('False Positive'),
    },
    {
      name: 'hosts',
      displayName: _('Number of Hosts'),
    },
  ];

  return (
    <FilterDialog onClose={onClose} onSave={handleSave}>
      <FilterStringGroup
        filter={filterString}
        name="filter_string"
        onChange={handleFilterStringChange}
      />

      <BooleanFilterGroup
        filter={filter}
        name="apply_overrides"
        title={_('Apply Overrides')}
        onChange={handleFilterValueChange}
      />

      <FilterSearchGroup
        filter={filter}
        name="name"
        title={_('Task Name')}
        onChange={handleSearchTermChange}
      />

      <SeverityValuesGroup
        filter={filter}
        name="severity"
        title={_('Severity of Last Report')}
        onChange={handleFilterValueChange}
      />

      <MinQodGroup
        filter={filter}
        name="min_qod"
        onChange={handleFilterValueChange}
      />

      <TaskTrendGroup filter={filter} onChange={handleFilterValueChange} />

      <FilterSearchGroup
        filter={filter}
        name="schedule"
        title={_('Schedule')}
        onChange={handleSearchTermChange}
      />

      <FilterSearchGroup
        filter={filter}
        name="comment"
        title={_('Comment')}
        onChange={handleSearchTermChange}
      />

      <FirstResultGroup filter={filter} onChange={handleFilterValueChange} />

      <ResultsPerPageGroup filter={filter} onChange={handleFilterValueChange} />

      <SortByGroup
        fields={SORT_FIELDS}
        filter={filter}
        onSortByChange={handleSortByChange}
        onSortOrderChange={handleSortOrderChange}
      />

      {capabilities.mayCreate('filter') && (
        <CreateNamedFilterGroup
          filterName={filterName}
          saveNamedFilter={saveNamedFilter}
          onValueChange={handleChange}
        />
      )}
    </FilterDialog>
  );
};

export default TaskFilterDialog;

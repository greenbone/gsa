/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
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
import useFilterDialogSave from 'web/components/powerfilter/useFilterDialogSave';
import useCapabilities from 'web/hooks/useCapabilities';
import useTranslation from 'web/hooks/useTranslation';
import PropTypes from 'web/utils/PropTypes';

const TaskFilterDialog = ({
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
    'task',
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

  const {
    filter,
    filterString,
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
        name="apply_overrides"
        title={_('Apply Overrides')}
        onChange={onFilterValueChange}
      />

      <FilterSearchGroup
        filter={filter}
        name="name"
        title={_('Task Name')}
        onChange={onSearchTermChange}
      />

      <SeverityValuesGroup
        filter={filter}
        name="severity"
        title={_('Severity of Last Report')}
        onChange={onFilterValueChange}
      />

      <MinQodGroup
        filter={filter}
        name="min_qod"
        onChange={onFilterValueChange}
      />

      <TaskTrendGroup filter={filter} onChange={onFilterValueChange} />

      <FilterSearchGroup
        filter={filter}
        name="schedule"
        title={_('Schedule')}
        onChange={onSearchTermChange}
      />

      <FilterSearchGroup
        filter={filter}
        name="comment"
        title={_('Comment')}
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

TaskFilterDialog.propTypes = {
  filter: PropTypes.filter,
  onClose: PropTypes.func,
  onCloseClick: PropTypes.func, // should be removed in future
  onFilterChanged: PropTypes.func,
  onFilterCreated: PropTypes.func,
};

export default TaskFilterDialog;

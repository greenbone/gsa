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
import SeverityLevelsGroup from 'web/components/powerfilter/SeverityLevelsGroup';
import SeverityValuesGroup from 'web/components/powerfilter/SeverityValuesGroup';
import SolutionTypeGroup from 'web/components/powerfilter/SolutionTypeGroup';
import SortByGroup from 'web/components/powerfilter/SortByGroup';
import useFilterDialog from 'web/components/powerfilter/useFilterDialog';
import useFilterDialogSave from 'web/components/powerfilter/useFilterDialogSave';
import useCapabilities from 'web/hooks/useCapabilities';
import useTranslation from 'web/hooks/useTranslation';
import PropTypes from 'web/utils/PropTypes';

const ResultsFilterDialog = ({
  filter: initialFilter,
  onClose,
  onFilterChanged,
  onFilterCreated,
}) => {
  const [_] = useTranslation();
  const capabilities = useCapabilities();
  const filterDialogProps = useFilterDialog(initialFilter);
  const [handleSave] = useFilterDialogSave(
    'result',
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
      name: 'solution_type',
      displayName: _('Solution type'),
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
      name: 'host',
      displayName: _('Host (IP)'),
    },
    {
      name: 'hostname',
      displayName: _('Host (Name)'),
    },
    {
      name: 'location',
      displayName: _('Location'),
    },
    {
      name: 'created',
      displayName: _('Created'),
    },
    {
      name: 'modified',
      displayName: _('Modified'),
    },
    {
      name: 'epss_score',
      displayName: _('EPSS Score'),
    },
    {
      name: 'epss_percentile',
      displayName: _('EPSS Percentile'),
    },
  ];

  const {
    filter,
    filterName,
    filterString,
    saveNamedFilter,
    onFilterChange,
    onFilterValueChange,
    onFilterStringChange,
    onSearchTermChange,
    onSortByChange,
    onSortOrderChange,
    onValueChange,
  } = filterDialogProps;

  const handleRemoveLevels = () =>
    onFilterChange(filter.copy().delete('levels'));
  return (
    <FilterDialog onClose={onClose} onSave={handleSave}>
      <FilterStringGroup
        filter={filterString}
        name="filterString"
        onChange={onFilterStringChange}
      />

      <BooleanFilterGroup
        filter={filter}
        name="apply_overrides"
        title={_('Apply Overrides')}
        onChange={onFilterValueChange}
      />

      <SeverityLevelsGroup
        filter={filter}
        onChange={onFilterValueChange}
        onRemove={handleRemoveLevels}
      />

      <SeverityValuesGroup
        filter={filter}
        name="severity"
        title={_('Severity')}
        onChange={onFilterValueChange}
      />

      <SolutionTypeGroup filter={filter} onChange={onFilterChange} />

      <MinQodGroup
        filter={filter}
        name="min_qod"
        onChange={onFilterValueChange}
      />

      <FilterSearchGroup
        filter={filter}
        name="owner"
        title={_('Owner')}
        onChange={onSearchTermChange}
      />

      <FilterSearchGroup
        filter={filter}
        name="vulnerability"
        title={_('Vulnerability')}
        onChange={onSearchTermChange}
      />

      <FilterSearchGroup
        filter={filter}
        name="host"
        title={_('Host (IP)')}
        onChange={onSearchTermChange}
      />

      <FilterSearchGroup
        filter={filter}
        name="location"
        title={_('Location (eg. port/protocol)')}
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

ResultsFilterDialog.propTypes = {
  filter: PropTypes.filter,
  onClose: PropTypes.func,
  onFilterChanged: PropTypes.func,
  onFilterCreated: PropTypes.func,
};

export default ResultsFilterDialog;

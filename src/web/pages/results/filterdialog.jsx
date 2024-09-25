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
import SeverityLevelsGroup from 'web/components/powerfilter/severitylevelsgroup';
import SolutionTypeGroup from 'web/components/powerfilter/solutiontypegroup';
import SeverityValuesGroup from 'web/components/powerfilter/severityvaluesgroup';
import FilterSearchGroup from 'web/components/powerfilter/filtersearchgroup';
import FilterDialog from 'web/components/powerfilter/filterdialog';

import useFilterDialog from 'web/components/powerfilter/useFilterDialog';
import useFilterDialogSave from 'web/components/powerfilter/useFilterDialogSave';

import useTranslation from 'web/hooks/useTranslation';
import useCapabilities from 'web/hooks/useCapabilities';

const ResultsFilterDialog = ({
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

      <SeverityLevelsGroup
        filter={filter}
        onChange={onFilterValueChange}
        onRemove={handleRemoveLevels}
      />

      <SeverityValuesGroup
        name="severity"
        filter={filter}
        title={_('Severity')}
        onChange={onFilterValueChange}
      />

      <SolutionTypeGroup filter={filter} onChange={onFilterChange} />

      <MinQodGroup
        name="min_qod"
        filter={filter}
        onChange={onFilterValueChange}
      />

      <FilterSearchGroup
        name="owner"
        filter={filter}
        title={_('Owner')}
        onChange={onSearchTermChange}
      />

      <FilterSearchGroup
        name="vulnerability"
        filter={filter}
        title={_('Vulnerability')}
        onChange={onSearchTermChange}
      />

      <FilterSearchGroup
        name="host"
        filter={filter}
        title={_('Host (IP)')}
        onChange={onSearchTermChange}
      />

      <FilterSearchGroup
        name="location"
        filter={filter}
        title={_('Location (eg. port/protocol)')}
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

ResultsFilterDialog.propTypes = {
  filter: PropTypes.filter,
  onClose: PropTypes.func,
  onCloseClick: PropTypes.func, // should be removed in future
  onFilterChanged: PropTypes.func,
  onFilterCreated: PropTypes.func,
};

export default ResultsFilterDialog;

// vim: set ts=2 sw=2 tw=80:

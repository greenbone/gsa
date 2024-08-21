/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import {_, _l} from 'gmp/locale/lang';

import Layout from 'web/components/layout/layout';

import compose from 'web/utils/compose';
import withCapabilities from 'web/utils/withCapabilities';

/* eslint-disable max-len */

import BooleanFilterGroup from 'web/components/powerfilter/booleanfiltergroup';
import CreateNamedFilterGroup from 'web/components/powerfilter/createnamedfiltergroup';
import FilterStringGroup from 'web/components/powerfilter/filterstringgroup';
import FirstResultGroup from 'web/components/powerfilter/firstresultgroup';
import MinQodGroup from 'web/components/powerfilter/minqodgroup';
import ResultsPerPageGroup from 'web/components/powerfilter/resultsperpagegroup';
import SortByGroup from 'web/components/powerfilter/sortbygroup';
import SeverityLevelsGroup from 'web/components/powerfilter/severitylevelsgroup';
import SolutionTypeGroup from 'web/components/powerfilter/solutiontypegroup';
import withFilterDialog from 'web/components/powerfilter/withFilterDialog';
import FilterDialogPropTypes from 'web/components/powerfilter/dialogproptypes';
import SeverityValuesGroup from 'web/components/powerfilter/severityvaluesgroup';
import FilterSearchGroup from 'web/components/powerfilter/filtersearchgroup';

/* eslint-enable */

const SORT_FIELDS = [
  {
    name: 'name',
    displayName: _l('Vulnerability'),
  },
  {
    name: 'solution_type',
    displayName: _l('Solution type'),
  },
  {
    name: 'severity',
    displayName: _l('Severity'),
  },
  {
    name: 'qod',
    displayName: _l('QoD'),
  },
  {
    name: 'host',
    displayName: _l('Host (IP)'),
  },
  {
    name: 'hostname',
    displayName: _l('Host (Name)'),
  },
  {
    name: 'location',
    displayName: _l('Location'),
  },
  {
    name: 'created',
    displayName: _l('Created'),
  },
  {
    name: 'modified',
    displayName: _l('Modified'),
  },
  {
    name: 'epss_score',
    displayName: _l('EPSS Score'),
  },
  {
    name: 'epss_percentile',
    displayName: _l('EPSS Percentile'),
  },
];

const ResultsFilterDialogComponent = ({
  capabilities,
  filter,
  filterName,
  filterNameValid,
  filterstring,
  saveNamedFilter,
  onFilterChange,
  onFilterStringChange,
  onFilterValueChange,
  onSearchTermChange,
  onSortByChange,
  onSortOrderChange,
  onValueChange,
}) => {
  const handleRemoveLevels = () => onFilterChange(filter.delete('levels'));
  return (
    <Layout flex="column">
      <FilterStringGroup
        name="filterstring"
        filter={filterstring}
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
    </Layout>
  );
};

ResultsFilterDialogComponent.propTypes = FilterDialogPropTypes;

export default compose(
  withCapabilities,
  withFilterDialog(),
)(ResultsFilterDialogComponent);

// vim: set ts=2 sw=2 tw=80:

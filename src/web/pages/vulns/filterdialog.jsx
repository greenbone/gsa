/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import {_l, _} from 'gmp/locale/lang';

import Layout from 'web/components/layout/layout';

import compose from 'web/utils/compose';
import withCapabilities from 'web/utils/withCapabilities';

/* eslint-disable max-len */

import CreateNamedFilterGroup from 'web/components/powerfilter/createnamedfiltergroup';
import FilterDialogPropTypes from 'web/components/powerfilter/dialogproptypes';
import withFilterDialog from 'web/components/powerfilter/withFilterDialog';

import FilterStringGroup from 'web/components/powerfilter/filterstringgroup';
import FirstResultGroup from 'web/components/powerfilter/firstresultgroup';
import ResultsPerPageGroup from 'web/components/powerfilter/resultsperpagegroup';
import SortByGroup from 'web/components/powerfilter/sortbygroup';
import FilterSearchGroup from 'web/components/powerfilter/filtersearchgroup';
import SeverityValuesGroup from 'web/components/powerfilter/severityvaluesgroup';
import MinQodGroup from 'web/components/powerfilter/minqodgroup';

const SORT_FIELDS = [
  {
    name: 'name',
    displayName: _l('Name'),
  },
  {
    name: 'oldest',
    displayName: _l('Oldest Result'),
  },
  {
    name: 'newest',
    displayName: _l('Newest Result'),
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
    name: 'results',
    displayName: _l('Results'),
  },
  {
    name: 'hosts',
    displayName: _l('Hosts'),
  },
];

const VulnsFilterDialogComponent = ({
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
}) => (
  <Layout flex="column">
    <FilterStringGroup
      name="filterstring"
      filter={filterstring}
      onChange={onFilterStringChange}
    />

    <SeverityValuesGroup
      name="severity"
      title={_('Severity')}
      filter={filter}
      onChange={onFilterValueChange}
    />

    <MinQodGroup
      name="min_qod"
      filter={filter}
      onChange={onFilterValueChange}
    />

    <FilterSearchGroup
      name="name"
      title={_('Name')}
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
  </Layout>
);

VulnsFilterDialogComponent.propTypes = FilterDialogPropTypes;

export default compose(
  withCapabilities,
  withFilterDialog(),
)(VulnsFilterDialogComponent);

// vim: set ts=2 sw=2 tw=80:

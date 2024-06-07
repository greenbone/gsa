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
import BooleanFilterGroup from 'web/components/powerfilter/booleanfiltergroup';

const SORT_FIELDS = [
  {
    name: 'text',
    displayName: _l('Text'),
  },
  {
    name: 'nvt',
    displayName: _l('Nvt'),
  },
  {
    name: 'hosts',
    displayName: _l('Hosts'),
  },
  {
    name: 'port',
    displayName: _l('Location'),
  },
  {
    name: 'active',
    displayName: _l('Active'),
  },
];

const NotesFilterDialogComponent = ({
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

    <BooleanFilterGroup
      name="active"
      title={_('Note is active')}
      filter={filter}
      onChange={onFilterValueChange}
    />

    <FilterSearchGroup
      name="text"
      title={_('Search by content')}
      filter={filter}
      onChange={onSearchTermChange}
    />

    <FilterSearchGroup
      name="nvt"
      title={_('NVT Name')}
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
  </Layout>
);

NotesFilterDialogComponent.propTypes = FilterDialogPropTypes;

export default compose(
  withCapabilities,
  withFilterDialog(),
)(NotesFilterDialogComponent);

// vim: set ts=2 sw=2 tw=80:

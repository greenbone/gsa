/* Copyright (C) 2016-2019 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 */
import React from 'react';

import {_l} from 'gmp/locale/lang';

import Layout from 'web/components/layout/layout';

import compose from 'web/utils/compose';
import withCapabilities from 'web/utils/withCapabilities';

/* eslint-disable max-len */

import CreateNamedFilterGroup from 'web/components/powerfilter/createnamedfiltergroup';
import FilterStringGroup from 'web/components/powerfilter/filterstringgroup';
import FirstResultGroup from 'web/components/powerfilter/firstresultgroup';
import ResultsPerPageGroup from 'web/components/powerfilter/resultsperpagegroup';
import SortByGroup from 'web/components/powerfilter/sortbygroup';
import FilterDialogPropTypes from 'web/components/powerfilter/dialogproptypes';
import withFilterDialog from 'web/components/powerfilter/withFilterDialog';
import TicketStatusFilterGroup from 'web/components/powerfilter/ticketstatusgroup';

const SORT_FIELDS = [
  {
    name: 'name',
    displayName: _l('Vulnerability'),
  },
  {
    name: 'severity',
    displayName: _l('Severity'),
  },
  {
    name: 'host',
    displayName: _l('Host'),
  },
  {
    name: 'solution_type',
    displayName: _l('Solution Type'),
    align: ['center', 'start'],
  },
  {
    name: 'username',
    displayName: _l('Assigned User'),
  },
  {
    name: 'opened',
    displayName: _l('Time Opened'),
  },
  {
    name: 'closed',
    displayName: _l('Time Closed'),
  },
  {
    name: 'modified',
    displayName: _l('Modification Time'),
  },
  {
    name: 'status',
    displayName: _l('Status'),
  },
];

const TicketsFilterDialogComponent = ({
  capabilities,
  filter,
  filterName,
  filterNameValid,
  filterstring,
  saveNamedFilter,
  onFilterChange,
  onFilterStringChange,
  onFilterValueChange,
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

    <TicketStatusFilterGroup filter={filter} onChange={onFilterValueChange} />

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

TicketsFilterDialogComponent.propTypes = FilterDialogPropTypes;

export default compose(
  withCapabilities,
  withFilterDialog(),
)(TicketsFilterDialogComponent);

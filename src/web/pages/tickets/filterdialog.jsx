/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import {_} from 'gmp/locale/lang';

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
import SeverityValuesGroup from 'web/components/powerfilter/severityvaluesgroup';
import SolutionTypeGroup from 'web/components/powerfilter/solutiontypegroup';

import {FIELDS} from './table';

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

    <SolutionTypeGroup filter={filter} onChange={onFilterChange} />

    <SeverityValuesGroup
      name="severity"
      title={_('Severity')}
      filter={filter}
      onChange={onFilterValueChange}
    />

    <TicketStatusFilterGroup filter={filter} onChange={onFilterValueChange} />

    <FirstResultGroup filter={filter} onChange={onFilterValueChange} />

    <ResultsPerPageGroup filter={filter} onChange={onFilterValueChange} />

    <SortByGroup
      filter={filter}
      fields={FIELDS}
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

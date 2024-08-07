/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */


import React from 'react';

import _ from 'gmp/locale';

import FormGroup from 'web/components/form/formgroup';
import Checkbox from 'web/components/form/checkbox';

import Layout from 'web/components/layout/layout';

/* eslint-disable max-len */

import BooleanFilterGroup from 'web/components/powerfilter/booleanfiltergroup';
import ComplianceLevelsFilterGroup from 'web/components/powerfilter/compliancelevelsgroup';
import FilterStringGroup from 'web/components/powerfilter/filterstringgroup';
import FirstResultGroup from 'web/components/powerfilter/firstresultgroup';
import MinQodGroup from 'web/components/powerfilter/minqodgroup';
import ResultsPerPageGroup from 'web/components/powerfilter/resultsperpagegroup';
import SolutionTypeGroup from 'web/components/powerfilter/solutiontypegroup';
import withFilterDialog from 'web/components/powerfilter/withFilterDialog';
import FilterDialogPropTypes from 'web/components/powerfilter/dialogproptypes';
import SeverityLevelsGroup from 'web/components/powerfilter/severitylevelsgroup';
import SeverityValuesGroup from 'web/components/powerfilter/severityvaluesgroup';
import CreateNamedFilterGroup from 'web/components/powerfilter/createnamedfiltergroup';
import FilterSearchGroup from 'web/components/powerfilter/filtersearchgroup';

/* eslint-enable */

import DeltaResultsFilterGroup from './deltaresultsfiltergroup';

import compose from 'web/utils/compose';
import withCapabilities from 'web/utils/withCapabilities';

const FilterDialog = ({
  audit = false,
  delta = false,
  filter,
  filterstring,
  onFilterChange,
  onFilterStringChange,
  onFilterValueChange,
  onSearchTermChange,
  capabilities,
  filterName,
  saveNamedFilter,
  onValueChange,
}) => {
  const result_hosts_only = filter.get('result_hosts_only');
  const handleRemoveLevels = () => onFilterChange(filter.delete('levels'));
  const handleRemoveCompliance = () =>
    onFilterChange(filter.delete('compliance_levels'));

  return (
    <Layout flex="column">
      <FilterStringGroup
        name="filterstring"
        filter={filterstring}
        onChange={onFilterStringChange}
      />

      {delta && (
        <DeltaResultsFilterGroup
          filter={filter}
          onChange={onFilterValueChange}
        />
      )}

      {!audit && (
        <BooleanFilterGroup
          name="apply_overrides"
          title={_('Apply Overrides')}
          filter={filter}
          onChange={onFilterValueChange}
        />
      )}

      <FormGroup title={_('Only show hosts that have results')}>
        <Checkbox
          name="result_hosts_only"
          checkedValue={1}
          unCheckedValue={0}
          checked={result_hosts_only === 1}
          onChange={onFilterValueChange}
        />
      </FormGroup>

      <MinQodGroup
        name="min_qod"
        filter={filter}
        onChange={onFilterValueChange}
      />

      {audit ? (
        <ComplianceLevelsFilterGroup
          isResult={true}
          filter={filter}
          onChange={onFilterValueChange}
          onRemove={handleRemoveCompliance}
        />
      ) : (
        <SeverityLevelsGroup
          filter={filter}
          onChange={onFilterValueChange}
          onRemove={handleRemoveLevels}
        />
      )}

      {!audit && (
        <SeverityValuesGroup
          name="severity"
          title={_('Severity')}
          filter={filter}
          onChange={onFilterValueChange}
        />
      )}

      <SolutionTypeGroup filter={filter} onChange={onFilterValueChange} />

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

FilterDialog.propTypes = FilterDialogPropTypes;

export default compose(withCapabilities, withFilterDialog())(FilterDialog);

// vim: set ts=2 sw=2 tw=80:

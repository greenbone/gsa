/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import Checkbox from 'web/components/form/checkbox';
import BooleanFilterGroup from 'web/components/powerfilter/booleanfiltergroup';
import ComplianceLevelsFilterGroup from 'web/components/powerfilter/compliancelevelsgroup';
import CreateNamedFilterGroup from 'web/components/powerfilter/createnamedfiltergroup';
import FilterDialog from 'web/components/powerfilter/filterdialog';
import FilterSearchGroup from 'web/components/powerfilter/filtersearchgroup';
import FilterStringGroup from 'web/components/powerfilter/filterstringgroup';
import FirstResultGroup from 'web/components/powerfilter/firstresultgroup';
import MinQodGroup from 'web/components/powerfilter/minqodgroup';
import ResultsPerPageGroup from 'web/components/powerfilter/resultsperpagegroup';
import SeverityLevelsGroup from 'web/components/powerfilter/severitylevelsgroup';
import SeverityValuesGroup from 'web/components/powerfilter/severityvaluesgroup';
import SolutionTypeGroup from 'web/components/powerfilter/solutiontypegroup';
import useFilterDialog from 'web/components/powerfilter/useFilterDialog';
import useFilterDialogSave from 'web/components/powerfilter/useFilterDialogSave';
import useCapabilities from 'web/hooks/useCapabilities';
import useTranslation from 'web/hooks/useTranslation';
import PropTypes from 'web/utils/proptypes';

import DeltaResultsFilterGroup from './deltaresultsfiltergroup';

const ReportDetailsFilterDialog = ({
  audit = false,
  delta = false,
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
  const {
    filter,
    filterName,
    filterString,
    saveNamedFilter,
    onFilterChange,
    onFilterValueChange,
    onFilterStringChange,
    onSearchTermChange,
    onValueChange,
  } = filterDialogProps;
  const resultHostsOnly = filter.get('result_hosts_only');
  const handleRemoveLevels = () =>
    onFilterChange(filter.copy().delete('levels'));
  const handleRemoveCompliance = () =>
    onFilterChange(filter.delete('compliance_levels'));
  return (
    <FilterDialog onClose={onClose} onSave={handleSave}>
      <FilterStringGroup
        filter={filterString}
        name="filterstring"
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
          filter={filter}
          name="apply_overrides"
          title={_('Apply Overrides')}
          onChange={onFilterValueChange}
        />
      )}

      <Checkbox
        checked={resultHostsOnly === 1}
        checkedValue={1}
        name="result_hosts_only"
        title={_('Only show hosts that have results')}
        unCheckedValue={0}
        onChange={onFilterValueChange}
      />

      <MinQodGroup
        filter={filter}
        name="min_qod"
        onChange={onFilterValueChange}
      />

      {audit ? (
        <ComplianceLevelsFilterGroup
          filter={filter}
          isResult={true}
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
          filter={filter}
          name="severity"
          title={_('Severity')}
          onChange={onFilterValueChange}
        />
      )}

      <SolutionTypeGroup filter={filter} onChange={onFilterValueChange} />

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

ReportDetailsFilterDialog.propTypes = {
  audit: PropTypes.bool,
  delta: PropTypes.bool,
  filter: PropTypes.filter,
  onClose: PropTypes.func,
  onCloseClick: PropTypes.func, // should be removed in future
  onFilterChanged: PropTypes.func,
  onFilterCreated: PropTypes.func,
};

export default ReportDetailsFilterDialog;

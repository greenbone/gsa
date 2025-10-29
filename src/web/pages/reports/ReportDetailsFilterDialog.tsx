/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type Filter from 'gmp/models/filter';
import Checkbox from 'web/components/form/Checkbox';
import BooleanFilterGroup from 'web/components/powerfilter/BooleanFilterGroup';
import ComplianceLevelsFilterGroup from 'web/components/powerfilter/ComplianceLevelsGroup';
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
import useFilterDialog from 'web/components/powerfilter/useFilterDialog';
import useFilterDialogSave, {
  type UseFilterDialogSaveProps,
  type UseFilterDialogStateProps,
} from 'web/components/powerfilter/useFilterDialogSave';
import useCapabilities from 'web/hooks/useCapabilities';
import useTranslation from 'web/hooks/useTranslation';
import DeltaResultsFilterGroup from 'web/pages/reports/DeltaResultsFilterGroup';

interface ReportDetailsFilterDialogProps extends UseFilterDialogSaveProps {
  audit?: boolean;
  delta?: boolean;
  filter?: Filter;
}

const ReportDetailsFilterDialog = ({
  audit = false,
  delta = false,
  filter: initialFilter,
  onClose,
  onFilterChanged,
  onFilterCreated,
}: ReportDetailsFilterDialogProps) => {
  const [_] = useTranslation();
  const capabilities = useCapabilities();
  const filterDialogProps =
    useFilterDialog<UseFilterDialogStateProps>(initialFilter);
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
        name="filterString"
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
        onChange={onFilterValueChange as (value: number, name?: string) => void}
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

      <SolutionTypeGroup
        filter={filter}
        onChange={value => onFilterChange(value)}
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

      {capabilities.mayCreate('filter') && (
        <CreateNamedFilterGroup
          filterName={filterName}
          saveNamedFilter={saveNamedFilter}
          onValueChange={onValueChange}
        />
      )}
    </FilterDialog>
  );
};

export default ReportDetailsFilterDialog;

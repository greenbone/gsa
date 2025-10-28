/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type Filter from 'gmp/models/filter';
import ComplianceLevelFilterGroup from 'web/components/powerfilter/ComplianceLevelsGroup';
import CreateNamedFilterGroup from 'web/components/powerfilter/CreateNamedFilterGroup';
import FilterDialog from 'web/components/powerfilter/FilterDialog';
import FilterSearchGroup from 'web/components/powerfilter/FilterSearchGroup';
import FilterStringGroup from 'web/components/powerfilter/FilterStringGroup';
import FirstResultGroup from 'web/components/powerfilter/FirstResultGroup';
import MinQodGroup from 'web/components/powerfilter/MinQodGroup';
import ResultsPerPageGroup from 'web/components/powerfilter/ResultsPerPageGroup';
import SortByGroup from 'web/components/powerfilter/SortByGroup';
import useFilterDialog from 'web/components/powerfilter/useFilterDialog';
import useFilterDialogSave, {
  type UseFilterDialogSaveProps,
  type UseFilterDialogStateProps,
} from 'web/components/powerfilter/useFilterDialogSave';
import useCapabilities from 'web/hooks/useCapabilities';
import useTranslation from 'web/hooks/useTranslation';

interface AuditReportFilterDialogProps extends UseFilterDialogSaveProps {
  filter?: Filter;
}

const AuditReportFilterDialog = ({
  filter: initialFilter,
  onClose,
  onFilterChanged,
  onFilterCreated,
}: AuditReportFilterDialogProps) => {
  const [_] = useTranslation();
  const capabilities = useCapabilities();
  const filterDialogProps =
    useFilterDialog<UseFilterDialogStateProps>(initialFilter);
  const [handleSave] = useFilterDialogSave(
    'report',
    {
      onClose,
      onFilterChanged,
      onFilterCreated,
    },
    filterDialogProps,
  );

  const {
    filterName,
    filter,
    filterString,
    saveNamedFilter,
    onFilterValueChange,
    onSearchTermChange,
    onSortByChange,
    onSortOrderChange,
    onFilterStringChange,
    onValueChange,
  } = filterDialogProps;
  const handleRemoveCompliance = () =>
    onFilterChanged &&
    onFilterChanged(filter.delete('report_compliance_levels'));
  const SORT_FIELDS = [
    {
      name: 'date',
      displayName: _('Date'),
    },
    {
      name: 'status',
      displayName: _('Status'),
    },
    {
      name: 'task',
      displayName: _('Task'),
    },
    {
      name: 'compliant',
      displayName: _('Compliant'),
    },
    {
      name: 'compliance_yes',
      displayName: _('Compliance: Yes'),
    },
    {
      name: 'compliance_no',
      displayName: _('Compliance: No'),
    },
    {
      name: 'compliance_incomplete',
      displayName: _('Compliance: Incomplete'),
    },
  ];

  return (
    <FilterDialog onClose={onClose} onSave={handleSave}>
      <FilterStringGroup
        filter={filterString}
        name="filterString"
        onChange={onFilterStringChange}
      />

      <ComplianceLevelFilterGroup
        filter={filter}
        onChange={onFilterValueChange}
        onRemove={handleRemoveCompliance}
      />

      <MinQodGroup
        filter={filter}
        name="min_qod"
        onChange={onFilterValueChange}
      />

      <FilterSearchGroup
        filter={filter}
        name="task"
        title={_('From Task (name)')}
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
          filterName={filterName}
          saveNamedFilter={saveNamedFilter}
          onValueChange={onValueChange}
        />
      )}
    </FilterDialog>
  );
};

export default AuditReportFilterDialog;

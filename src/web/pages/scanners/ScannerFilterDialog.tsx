/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type Filter from 'gmp/models/filter';
import {
  AGENT_CONTROLLER_SCANNER_TYPE,
  AGENT_CONTROLLER_SENSOR_SCANNER_TYPE,
  GREENBONE_SENSOR_SCANNER_TYPE,
  OPENVAS_SCANNER_TYPE,
  OPENVASD_SCANNER_TYPE,
  type ScannerType,
  scannerTypeName,
} from 'gmp/models/scanner';
import {isDefined} from 'gmp/utils/identity';
import Select from 'web/components/form/Select';
import CreateNamedFilterGroup from 'web/components/powerfilter/CreateNamedFilterGroup';
import FilterDialog from 'web/components/powerfilter/FilterDialog';
import FilterStringGroup from 'web/components/powerfilter/FilterStringGroup';
import FirstResultGroup from 'web/components/powerfilter/FirstResultGroup';
import ResultsPerPageGroup from 'web/components/powerfilter/ResultsPerPageGroup';
import SortByGroup from 'web/components/powerfilter/SortByGroup';
import useFilterDialog from 'web/components/powerfilter/useFilterDialog';
import useFilterDialogSave, {
  type UseFilterDialogSaveProps,
  type UseFilterDialogStateProps,
} from 'web/components/powerfilter/useFilterDialogSave';
import useCapabilities from 'web/hooks/useCapabilities';
import useFeatures from 'web/hooks/useFeatures';
import useGmp from 'web/hooks/useGmp';
import useTranslation from 'web/hooks/useTranslation';

interface ScannerFilterDialogProps extends UseFilterDialogSaveProps {
  filter?: Filter;
}

interface ScannerTypeGroupProps {
  filter?: Filter;
  onFilterValueChange: (value: string, name: string) => void;
}

const ScannerTypeGroup = ({
  filter,
  onFilterValueChange,
}: ScannerTypeGroupProps) => {
  const capabilities = useCapabilities();
  const features = useFeatures();
  const gmp = useGmp();
  const [_] = useTranslation();

  const currentScannerType = filter?.get('type') as string | undefined;
  const scannerTypes: ScannerType[] = [
    OPENVAS_SCANNER_TYPE,
    OPENVASD_SCANNER_TYPE,
  ];
  if (
    features.featureEnabled('ENABLE_AGENTS') &&
    capabilities.mayAccess('agent')
  ) {
    scannerTypes.push(AGENT_CONTROLLER_SCANNER_TYPE);
    if (gmp.settings.enableGreenboneSensor) {
      scannerTypes.push(AGENT_CONTROLLER_SENSOR_SCANNER_TYPE);
    }
  }
  if (gmp.settings.enableGreenboneSensor) {
    scannerTypes.push(GREENBONE_SENSOR_SCANNER_TYPE);
  }

  const scannerTypesOptions = scannerTypes.map(scannerType => ({
    label: scannerTypeName(scannerType),
    value: scannerType,
  }));
  return (
    <Select
      items={scannerTypesOptions}
      label={_('Scanner Type')}
      name="type"
      value={currentScannerType}
      onChange={onFilterValueChange as (value: string, name?: string) => void}
    />
  );
};

const ScannerFilterDialog = ({
  filter: initialFilter,
  onClose,
  onFilterChanged,
  onFilterCreated,
}: ScannerFilterDialogProps) => {
  const [_] = useTranslation();
  const capabilities = useCapabilities();
  const initialFilterString = isDefined(initialFilter)
    ? initialFilter.copy().delete('type').toFilterCriteriaString()
    : '';
  const filterDialogProps = useFilterDialog<UseFilterDialogStateProps>(
    initialFilter,
    initialFilterString,
  );
  const [handleSave] = useFilterDialogSave(
    'scanner',
    {
      onClose,
      onFilterChanged,
      onFilterCreated,
    },
    filterDialogProps,
  );
  const sortFields = [
    {
      name: 'name',
      displayName: _('Name'),
    },
    {
      name: 'host',
      displayName: _('Host'),
    },
    {
      name: 'port',
      displayName: _('Port'),
      width: '20%',
    },
    {
      name: 'type',
      displayName: _('Type'),
    },
    {
      name: 'credential',
      displayName: _('Credential'),
    },
  ];
  const {
    filter,
    filterString,
    filterName,
    saveNamedFilter,
    onValueChange,
    onFilterStringChange,
    onFilterValueChange,
    onSortByChange,
    onSortOrderChange,
  } = filterDialogProps;
  return (
    <FilterDialog onClose={onClose} onSave={handleSave}>
      <FilterStringGroup
        filter={filterString}
        name="filterString"
        onChange={onFilterStringChange}
      />
      <ScannerTypeGroup
        filter={filter}
        onFilterValueChange={onFilterValueChange}
      />
      <FirstResultGroup filter={filter} onChange={onFilterValueChange} />
      <ResultsPerPageGroup filter={filter} onChange={onFilterValueChange} />
      <SortByGroup
        fields={sortFields}
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

export default ScannerFilterDialog;

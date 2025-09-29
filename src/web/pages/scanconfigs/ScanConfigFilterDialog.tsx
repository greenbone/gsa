/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Filter from 'gmp/models/filter';
import DefaultFilterDialog from 'web/components/powerfilter/DefaultFilterDialog';
import FilterDialog from 'web/components/powerfilter/FilterDialog';
import useFilterDialog from 'web/components/powerfilter/useFilterDialog';
import useFilterDialogSave, {
  UseFilterDialogSaveProps,
  UseFilterDialogStateProps,
} from 'web/components/powerfilter/useFilterDialogSave';
import useTranslation from 'web/hooks/useTranslation';

interface ScanConfigFilterDialogProps extends UseFilterDialogSaveProps {
  filter?: Filter;
}

const ScanConfigFilterDialog = ({
  filter,
  onClose,
  onFilterChanged,
  onFilterCreated,
}: ScanConfigFilterDialogProps) => {
  const [_] = useTranslation();
  const filterDialogProps = useFilterDialog<UseFilterDialogStateProps>(filter);
  const [handleSave] = useFilterDialogSave(
    'scanconfig',
    {
      onClose,
      onFilterChanged,
      onFilterCreated,
    },
    filterDialogProps,
  );

  const SORT_FIELDS = [
    {
      name: 'name',
      displayName: _('Name'),
    },
    {
      name: 'families_total',
      displayName: _('Families: Total'),
    },
    {
      name: 'families_trend',
      displayName: _('Families: Trend'),
    },
    {
      name: 'nvts_total',
      displayName: _('NVTs: Total'),
    },
    {
      name: 'nvts_trend',
      displayName: _('NVTs: Trend'),
    },
  ];

  return (
    <FilterDialog onClose={onClose} onSave={handleSave}>
      <DefaultFilterDialog {...filterDialogProps} sortFields={SORT_FIELDS} />
    </FilterDialog>
  );
};

export default ScanConfigFilterDialog;

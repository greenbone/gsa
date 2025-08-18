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

interface CertBundFilterDialogProps extends UseFilterDialogSaveProps {
  filter?: Filter;
}

const CertBundFilterDialog = ({
  filter,
  onClose,
  onFilterChanged,
  onFilterCreated,
}: CertBundFilterDialogProps) => {
  const [_] = useTranslation();
  const filterDialogProps = useFilterDialog<UseFilterDialogStateProps>(filter);
  const [handleSave] = useFilterDialogSave(
    'info',
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
      name: 'title',
      displayName: _('Title'),
    },
    {
      name: 'created',
      displayName: _('Created'),
    },
    {
      name: 'cves',
      displayName: _('CVEs'),
    },
    {
      name: 'severity',
      displayName: _('Severity'),
    },
  ];
  return (
    <FilterDialog onClose={onClose} onSave={handleSave}>
      <DefaultFilterDialog {...filterDialogProps} sortFields={SORT_FIELDS} />
    </FilterDialog>
  );
};

export default CertBundFilterDialog;

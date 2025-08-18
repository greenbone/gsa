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

interface CredentialFilterDialogProps extends UseFilterDialogSaveProps {
  filter?: Filter;
}

const CredentialFilterDialog = ({
  filter,
  onClose,
  onFilterChanged,
  onFilterCreated,
}: CredentialFilterDialogProps) => {
  const [_] = useTranslation();
  const filterDialogProps = useFilterDialog<UseFilterDialogStateProps>(filter);
  const [handleSave] = useFilterDialogSave(
    'credential',
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
      name: 'type',
      displayName: _('Type'),
    },
    {
      name: 'allow_insecure',
      displayName: _('Allow insecure use'),
    },
    {
      name: 'login',
      displayName: _('Login'),
    },
  ];

  return (
    <FilterDialog onClose={onClose} onSave={handleSave}>
      <DefaultFilterDialog {...filterDialogProps} sortFields={SORT_FIELDS} />
    </FilterDialog>
  );
};

export default CredentialFilterDialog;

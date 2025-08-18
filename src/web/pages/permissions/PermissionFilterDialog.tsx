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

interface PermissionFilterDialogProps extends UseFilterDialogSaveProps {
  filter?: Filter;
}

const PermissionFilterDialog = ({
  filter,
  onClose,
  onFilterChanged,
  onFilterCreated,
}: PermissionFilterDialogProps) => {
  const [_] = useTranslation();
  const filterDialogProps = useFilterDialog<UseFilterDialogStateProps>(filter);
  const [handleSave] = useFilterDialogSave(
    'permission',
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
      name: 'description',
      displayName: _('Description'),
    },
    {
      name: 'type',
      displayName: _('Resource Type'),
    },
    {
      name: '_resource',
      displayName: _('Resource'),
    },
    {
      name: 'subject_type',
      displayName: _('Subject Type'),
    },
    {
      name: '_subject',
      displayName: _('Subject'),
    },
  ];

  return (
    <FilterDialog onClose={onClose} onSave={handleSave}>
      <DefaultFilterDialog {...filterDialogProps} sortFields={SORT_FIELDS} />
    </FilterDialog>
  );
};

export default PermissionFilterDialog;

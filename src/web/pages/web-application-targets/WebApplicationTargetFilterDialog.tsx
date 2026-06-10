/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type Filter from 'gmp/models/filter';
import DefaultFilterDialog from 'web/components/powerfilter/DefaultFilterDialog';
import FilterDialog from 'web/components/powerfilter/FilterDialog';
import useFilterDialog from 'web/components/powerfilter/useFilterDialog';
import useFilterDialogSave, {
  type UseFilterDialogSaveProps,
  type UseFilterDialogStateProps,
} from 'web/components/powerfilter/useFilterDialogSave';
import useTranslation from 'web/hooks/useTranslation';

interface WebApplicationTargetFilterDialogProps extends UseFilterDialogSaveProps {
  filter?: Filter;
}

const WebApplicationTargetFilterDialog = ({
  filter,
  onClose,
  onFilterChanged,
  onFilterCreated,
}: WebApplicationTargetFilterDialogProps) => {
  const [_] = useTranslation();
  const filterDialogProps = useFilterDialog<UseFilterDialogStateProps>(filter);

  const [handleSave] = useFilterDialogSave(
    'target',
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
      name: 'url',
      displayName: _('URL'),
    },
    {
      name: 'credential',
      displayName: _('Credential'),
    },
  ];

  return (
    <FilterDialog onClose={onClose} onSave={handleSave}>
      <DefaultFilterDialog {...filterDialogProps} sortFields={SORT_FIELDS} />
    </FilterDialog>
  );
};

export default WebApplicationTargetFilterDialog;

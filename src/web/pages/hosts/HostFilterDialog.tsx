/* SPDX-FileCopyrightText: 2024 Greenbone AG
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

interface HostFilterDialogProps extends UseFilterDialogSaveProps {
  filter?: Filter;
}

const HostFilterDialog = ({
  filter,
  onClose,
  onFilterChanged,
  onFilterCreated,
}: HostFilterDialogProps) => {
  const [_] = useTranslation();
  const filterDialogProps = useFilterDialog<UseFilterDialogStateProps>(filter);
  const [handleSave] = useFilterDialogSave(
    'host',
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
      name: 'hostname',
      displayName: _('Hostname'),
    },
    {
      name: 'ip',
      displayName: _('IP Address'),
    },
    {
      name: 'os',
      displayName: _('Operating System'),
    },
    {
      name: 'severity',
      displayName: _('Severity'),
    },
    {
      name: 'modified',
      displayName: _('Modified'),
    },
  ];

  return (
    <FilterDialog onClose={onClose} onSave={handleSave}>
      <DefaultFilterDialog {...filterDialogProps} sortFields={SORT_FIELDS} />
    </FilterDialog>
  );
};

export default HostFilterDialog;

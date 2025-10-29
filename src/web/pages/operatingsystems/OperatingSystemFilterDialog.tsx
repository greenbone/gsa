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

interface OperatingSystemFilterDialogProps extends UseFilterDialogSaveProps {
  filter?: Filter;
}

const OperatingSystemFilterDialog = ({
  filter,
  onClose,
  onFilterChanged,
  onFilterCreated,
}: OperatingSystemFilterDialogProps) => {
  const [_] = useTranslation();
  const filterDialogProps = useFilterDialog<UseFilterDialogStateProps>(filter);
  const [handleSave] = useFilterDialogSave(
    'operatingsystem',
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
      name: 'latest_severity',
      displayName: _('Severity: Latest'),
    },
    {
      name: 'highest_severity',
      displayName: _('Severity: Highest'),
    },
    {
      name: 'average_severity',
      displayName: _('Severity: Average'),
    },
    {
      name: 'all_hosts',
      displayName: _('Hosts (All)'),
    },
    {
      name: 'hosts',
      displayName: _('Hosts (Best OS)'),
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

export default OperatingSystemFilterDialog;

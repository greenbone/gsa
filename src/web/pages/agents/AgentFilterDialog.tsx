/* SPDX-FileCopyrightText: 2025 Greenbone AG
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

interface AgentsFilterDialogProps extends UseFilterDialogSaveProps {
  filter?: Filter;
}

const AgentsFilterDialog = ({
  filter: initialFilter,
  onClose,
  onFilterChanged,
  onFilterCreated,
}: AgentsFilterDialogProps) => {
  const [_] = useTranslation();
  const filterDialogProps =
    useFilterDialog<UseFilterDialogStateProps>(initialFilter);
  const [handleSave] = useFilterDialogSave(
    'agent',
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
      displayName: _('Agent'),
    },
    {
      name: 'scanner',
      displayName: _('Network'),
    },
    {
      name: 'agent_version',
      displayName: _('Version'),
    },
    {
      name: 'last_update',
      displayName: _('Last Contact'),
    },
    {
      name: 'connection_status',
      displayName: _('Status'),
    },
    {
      name: 'authorized',
      displayName: _('Authorized'),
    },
  ];
  return (
    <FilterDialog onClose={onClose} onSave={handleSave}>
      <DefaultFilterDialog {...filterDialogProps} sortFields={SORT_FIELDS} />
    </FilterDialog>
  );
};

export default AgentsFilterDialog;

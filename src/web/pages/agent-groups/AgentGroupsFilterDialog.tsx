/* SPDX-FileCopyrightText: 2025 Greenbone AG
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

interface AgentGroupsFilterDialogProps extends UseFilterDialogSaveProps {
  filter?: Filter;
}

const AgentGroupsFilterDialog = ({
  filter: initialFilter,
  onClose,
  onFilterChanged,
  onFilterCreated,
}: AgentGroupsFilterDialogProps) => {
  const [_] = useTranslation();
  const filterDialogProps =
    useFilterDialog<UseFilterDialogStateProps>(initialFilter);
  const [handleSave] = useFilterDialogSave(
    'agentgroup',
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
      displayName: _('Group Name'),
    },
    {
      name: 'scanner',
      displayName: _('Network (Controller Name)'),
    },
    {
      name: 'agent_version',
      displayName: _('# of Agents'),
    },
    {
      name: 'last_update',
      displayName: _('Last Update'),
    },
  ];
  return (
    <FilterDialog onClose={onClose} onSave={handleSave}>
      <DefaultFilterDialog {...filterDialogProps} sortFields={SORT_FIELDS} />
    </FilterDialog>
  );
};

export default AgentGroupsFilterDialog;

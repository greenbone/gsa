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

interface AlertFilterDialogProps extends UseFilterDialogSaveProps {
  filter?: Filter;
}

const AlertFilterDialog = ({
  filter: initialFilter,
  onClose,
  onFilterChanged,
  onFilterCreated,
}: AlertFilterDialogProps) => {
  const [_] = useTranslation();
  const filterDialogProps =
    useFilterDialog<UseFilterDialogStateProps>(initialFilter);
  const [handleSave] = useFilterDialogSave(
    'alert',
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
      width: '25%',
    },
    {
      name: 'event',
      displayName: _('Event'),
      width: '21%',
    },
    {
      name: 'condition',
      displayName: _('Condition'),
      width: '21%',
    },
    {
      name: 'method',
      displayName: _('Method'),
      width: '10%',
    },
    {
      name: 'filter',
      displayName: _('Filter'),
      width: '10%',
    },
    {
      name: 'active',
      displayName: _('Active'),
      width: '5%',
    },
  ];
  return (
    <FilterDialog onClose={onClose} onSave={handleSave}>
      <DefaultFilterDialog {...filterDialogProps} sortFields={SORT_FIELDS} />
    </FilterDialog>
  );
};

export default AlertFilterDialog;

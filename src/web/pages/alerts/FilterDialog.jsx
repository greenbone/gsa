/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import DefaultFilterDialog from 'web/components/powerfilter/Dialog';
import FilterDialog from 'web/components/powerfilter/FilterDialog';
import useFilterDialog from 'web/components/powerfilter/useFilterDialog';
import useFilterDialogSave from 'web/components/powerfilter/useFilterDialogSave';
import useTranslation from 'web/hooks/useTranslation';
import PropTypes from 'web/utils/PropTypes';

const AlertsFilterDialog = ({
  filter,
  onClose,
  onFilterChanged,
  onFilterCreated,
  ...props
}) => {
  const [_] = useTranslation();
  const filterDialogProps = useFilterDialog(filter);
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
      <DefaultFilterDialog
        {...props}
        {...filterDialogProps}
        sortFields={SORT_FIELDS}
      />
    </FilterDialog>
  );
};

AlertsFilterDialog.propTypes = {
  filter: PropTypes.filter,
  onClose: PropTypes.func,
  onFilterChanged: PropTypes.func,
  onFilterCreated: PropTypes.func,
};

export default AlertsFilterDialog;

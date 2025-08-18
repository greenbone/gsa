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

const ScanConfigFilterDialog = ({
  filter,
  onClose,
  onFilterChanged,
  onFilterCreated,
  ...props
}) => {
  const [_] = useTranslation();
  const filterDialogProps = useFilterDialog(filter);
  const [handleSave] = useFilterDialogSave(
    'config',
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
      name: 'families_total',
      displayName: _('Families: Total'),
    },
    {
      name: 'families_trend',
      displayName: _('Families: Trend'),
    },
    {
      name: 'nvts_total',
      displayName: _('NVTs: Total'),
    },
    {
      name: 'nvts_trend',
      displayName: _('NVTs: Trend'),
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

ScanConfigFilterDialog.propTypes = {
  filter: PropTypes.filter,
  onClose: PropTypes.func,
  onFilterChanged: PropTypes.func,
  onFilterCreated: PropTypes.func,
};

export default ScanConfigFilterDialog;

/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import PropTypes from 'web/utils/proptypes';

import DefaultFilterDialog from 'web/components/powerfilter/dialog';
import FilterDialog from 'web/components/powerfilter/filterdialog';
import useFilterDialog from 'web/components/powerfilter/useFilterDialog';
import useFilterDialogSave from 'web/components/powerfilter/useFilterDialogSave';

import useTranslation from 'web/hooks/useTranslation';

const NvtsFilterDialog = ({
  filter,
  onCloseClick,
  onClose = onCloseClick,
  onFilterChanged,
  onFilterCreated,
  ...props
}) => {
  const [_] = useTranslation();
  const filterDialogProps = useFilterDialog(filter);
  const [handleSave] = useFilterDialogSave(
    'info',
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
      name: 'family',
      displayName: _('Family'),
    },
    {
      name: 'created',
      displayName: _('Created'),
    },
    {
      name: 'modified',
      displayName: _('Modified'),
    },
    {
      name: 'version',
      displayName: _('Version'),
    },
    {
      name: 'cve',
      displayName: _('CVE'),
    },
    {
      name: 'solution_type',
      displayName: _('Solution Type'),
    },
    {
      name: 'severity',
      displayName: _('Severity'),
    },
    {
      name: 'qod',
      displayName: _('QoD'),
    },
    {
      name: 'epss_score',
      displayName: _('EPSS Score'),
    },
    {
      name: 'epss_percentile',
      displayName: _('EPSS Percentile'),
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

NvtsFilterDialog.propTypes = {
  filter: PropTypes.filter,
  onClose: PropTypes.func,
  onCloseClick: PropTypes.func, // should be removed in future
  onFilterChanged: PropTypes.func,
  onFilterCreated: PropTypes.func,
};

export default NvtsFilterDialog;

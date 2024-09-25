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

const ReportFormatsFilterDialog = ({
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
    'report_format',
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
      name: 'extension',
      displayName: _('Extension'),
    },
    {
      name: 'content_type',
      displayName: _('Content Type'),
    },
    {
      name: 'trust',
      displayName: _('Trust (Last Verified)'),
    },
    {
      name: 'active',
      displayName: _('Active'),
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

ReportFormatsFilterDialog.propTypes = {
  filter: PropTypes.filter,
  onClose: PropTypes.func,
  onCloseClick: PropTypes.func, // should be removed in future
  onFilterChanged: PropTypes.func,
  onFilterCreated: PropTypes.func,
};

export default ReportFormatsFilterDialog;

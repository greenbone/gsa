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

const CvesFilterDialog = ({
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
      name: 'vector',
      displayName: _('Vector'),
    },
    {
      name: 'complexity',
      displayName: _('Complexity'),
    },
    {
      name: 'authentication',
      displayName: _('Authentication'),
    },
    {
      name: 'confidentiality_impact',
      displayName: _('Confidentiality Impact'),
    },
    {
      name: 'integrity_impact',
      displayName: _('Integrity Impact'),
    },
    {
      name: 'availability_impact',
      displayName: _('Availability Impact'),
    },
    {
      name: 'published',
      displayName: _('Published'),
    },
    {
      name: 'severity',
      displayName: _('Severity'),
    },
    {
      name: 'epss_score',
      displayName: _('EPSS Score'),
    },
    {
      name: 'epss_percentile',
      displayName: _('EPSS Percentage'),
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

CvesFilterDialog.propTypes = {
  filter: PropTypes.filter,
  onClose: PropTypes.func,
  onCloseClick: PropTypes.func, // should be removed in future
  onFilterChanged: PropTypes.func,
  onFilterCreated: PropTypes.func,
};

export default CvesFilterDialog;

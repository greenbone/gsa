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

interface CveFilterDialogProps extends UseFilterDialogSaveProps {
  filter?: Filter;
}

const CveFilterDialog = ({
  filter,
  onClose,
  onFilterChanged,
  onFilterCreated,
}: CveFilterDialogProps) => {
  const [_] = useTranslation();
  const filterDialogProps = useFilterDialog<UseFilterDialogStateProps>(filter);
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
      displayName: _('EPSS Percentile'),
    },
  ];

  return (
    <FilterDialog onClose={onClose} onSave={handleSave}>
      <DefaultFilterDialog {...filterDialogProps} sortFields={SORT_FIELDS} />
    </FilterDialog>
  );
};

export default CveFilterDialog;

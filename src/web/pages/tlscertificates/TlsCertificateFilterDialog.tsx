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

interface TlsCertificateFilterDialogProps extends UseFilterDialogSaveProps {
  filter?: Filter;
}

const TlsCertificateFilterDialog = ({
  filter,
  onClose,
  onFilterChanged,
  onFilterCreated,
}: TlsCertificateFilterDialogProps) => {
  const [_] = useTranslation();
  const filterDialogProps = useFilterDialog<UseFilterDialogStateProps>(filter);
  const [handleSave] = useFilterDialogSave(
    'tlscertificate',
    {
      onClose,
      onFilterChanged,
      onFilterCreated,
    },
    filterDialogProps,
  );
  const SORT_FIELDS = [
    {
      name: 'subject_dn',
      displayName: _('Subject DN'),
    },
    {
      name: 'issuer_dn',
      displayName: _('Issuer DN'),
    },
    {
      name: 'serial',
      displayName: _('Serial'),
    },
    {
      name: 'activates',
      displayName: _('Activates'),
    },
    {
      name: 'expires',
      displayName: _('Expires'),
    },
    {
      name: 'lastSeen',
      displayName: _('Last Seen'),
    },
  ];

  return (
    <FilterDialog onClose={onClose} onSave={handleSave}>
      <DefaultFilterDialog {...filterDialogProps} sortFields={SORT_FIELDS} />
    </FilterDialog>
  );
};

export default TlsCertificateFilterDialog;

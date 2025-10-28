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
import useGmp from 'web/hooks/useGmp';
import useTranslation from 'web/hooks/useTranslation';

interface TargetFilterDialogProps extends UseFilterDialogSaveProps {
  filter?: Filter;
}

const TargetFilterDialog = ({
  filter,
  onClose,
  onFilterChanged,
  onFilterCreated,
}: TargetFilterDialogProps) => {
  const [_] = useTranslation();
  const gmp = useGmp();
  const filterDialogProps = useFilterDialog<UseFilterDialogStateProps>(filter);

  const [handleSave] = useFilterDialogSave(
    'target',
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
      name: 'hosts',
      displayName: _('Hosts'),
    },
    {
      name: 'ips',
      displayName: _('IPs'),
    },
    {
      name: 'port_list',
      displayName: _('Port List'),
    },
    {
      name: 'ssh_credential',
      displayName: _('SSH Credential'),
    },
    ...(gmp.settings.enableKrb5
      ? [
          {
            name: 'krb5_credential',
            displayName: _('SMB (Kerberos) Credential'),
          },
        ]
      : []),
    {
      name: 'smb_credential',
      displayName: _('SMB (NTLM) Credential'),
    },

    {
      name: 'esxi_credential',
      displayName: _('ESXi Credential'),
    },
    {
      name: 'snmp_credential',
      displayName: _('SNMP Credential'),
    },
  ];

  return (
    <FilterDialog onClose={onClose} onSave={handleSave}>
      <DefaultFilterDialog {...filterDialogProps} sortFields={SORT_FIELDS} />
    </FilterDialog>
  );
};

export default TargetFilterDialog;

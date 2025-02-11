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

const TargetsFilterDialog = ({
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
    {
      name: 'smb_credential',
      displayName: _('SMB Credential'),
    },
    {
      name: 'esxi_credential',
      displayName: _('ESXi Credential'),
    },
    {
      name: 'snmp_credential',
      displayName: _('SNMP Credential'),
    },
    {
      name: 'krb5_credential',
      displayName: _('Kerberos Credential'),
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

TargetsFilterDialog.propTypes = {
  filter: PropTypes.filter,
  onClose: PropTypes.func,
  onCloseClick: PropTypes.func, // should be removed in future
  onFilterChanged: PropTypes.func,
  onFilterCreated: PropTypes.func,
};

export default TargetsFilterDialog;

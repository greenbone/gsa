/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {_l} from 'gmp/locale/lang';

import {createFilterDialog} from 'web/components/powerfilter/dialog';

const SORT_FIELDS = [
  {
    name: 'name',
    displayName: _l('Name'),
  },
  {
    name: 'hosts',
    displayName: _l('Hosts'),
  },
  {
    name: 'ips',
    displayName: _l('IPs'),
  },
  {
    name: 'port_list',
    displayName: _l('Port List'),
  },
  {
    name: 'ssh_credential',
    displayName: _l('SSH Credential'),
  },
  {
    name: 'smb_credential',
    displayName: _l('SMB Credential'),
  },
  {
    name: 'esxi_credential',
    displayName: _l('ESXi Credential'),
  },
  {
    name: 'snmp_credential',
    displayName: _l('SNMP Credential'),
  },
];

export default createFilterDialog({
  sortFields: SORT_FIELDS,
});

// vim: set ts=2 sw=2 tw=80:

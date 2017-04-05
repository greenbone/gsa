/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2016 Greenbone Networks GmbH
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 */

import moment from 'moment';

import Model from '../model.js';

import {is_defined} from '../../utils.js';

export const USERNAME_PASSWORD_CREDENTIAL_TYPE = 'up';
export const USERNAME_SSH_KEY_CREDENTIAL_TYPE = 'usk';
export const CLIENT_CERTIFICATE_CREDENTIAL_TYPE = 'cc';
export const SNMP_CREDENTIAL_TYPE = 'snmp';

export const SSH_CREDENTIAL_TYPES = [
  USERNAME_PASSWORD_CREDENTIAL_TYPE,
  USERNAME_SSH_KEY_CREDENTIAL_TYPE,
];

export const SMB_CREDENTIAL_TYPES = [
  USERNAME_PASSWORD_CREDENTIAL_TYPE,
];

export const ESXI_CREDENTIAL_TYPES = [
  USERNAME_PASSWORD_CREDENTIAL_TYPE,
];

export const SNMP_CREDENTIAL_TYPES = [
  SNMP_CREDENTIAL_TYPE,
];

export const ALL_CREDENTIAL_TYPES = [
  USERNAME_PASSWORD_CREDENTIAL_TYPE,
  USERNAME_SSH_KEY_CREDENTIAL_TYPE,
  CLIENT_CERTIFICATE_CREDENTIAL_TYPE,
  SNMP_CREDENTIAL_TYPE,
];

export const ssh_credential_filter = credential =>
  credential.type === SSH_CREDENTIAL_TYPES ||
  credential.type === USERNAME_PASSWORD_CREDENTIAL_TYPE;

export const smb_credential_filter = credential =>
  credential.type === USERNAME_PASSWORD_CREDENTIAL_TYPE;

export const esxi_credential_filter = credential =>
  credential.type === USERNAME_PASSWORD_CREDENTIAL_TYPE;

export const snmp_credential_filter = credential =>
  credential.type === SNMP_CREDENTIAL_TYPE;

export class Credential extends Model {

  parseProperties(elem) {
    let ret = super.parseProperties(elem);

    if (is_defined(ret.certificate_info)) {
      ret.certificate_info.activation_time = moment(
        ret.certificate_info.activation_time
      );
      ret.certificate_info.expiration_time = moment(
        ret.certificate_info.expiration_time
      );
    }
    return ret;
  }

  isAllowInsecure() {
    return this.allow_insecure !== '0';
  }
}

export default Credential;

// vim: set ts=2 sw=2 tw=80:

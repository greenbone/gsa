/* Copyright (C) 2016-2021 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
import Model, {parseModelFromElement} from 'gmp/model';

import {_, _l} from 'gmp/locale/lang';

import {isDefined} from 'gmp/utils/identity';
import {map} from 'gmp/utils/array';

import {parseYesNo, NO_VALUE, parseDate, parseBoolean} from 'gmp/parser';

export const USERNAME_PASSWORD_CREDENTIAL_TYPE = 'up';
export const USERNAME_SSH_KEY_CREDENTIAL_TYPE = 'usk';
export const CLIENT_CERTIFICATE_CREDENTIAL_TYPE = 'cc';
export const SNMP_CREDENTIAL_TYPE = 'snmp';
export const SMIME_CREDENTIAL_TYPE = 'smime';
export const PGP_CREDENTIAL_TYPE = 'pgp';
export const PASSWORD_ONLY_CREDENTIAL_TYPE = 'pw';

export const SSH_CREDENTIAL_TYPES = [
  USERNAME_PASSWORD_CREDENTIAL_TYPE,
  USERNAME_SSH_KEY_CREDENTIAL_TYPE,
];

export const SMB_CREDENTIAL_TYPES = [USERNAME_PASSWORD_CREDENTIAL_TYPE];

export const ESXI_CREDENTIAL_TYPES = [USERNAME_PASSWORD_CREDENTIAL_TYPE];

export const SNMP_CREDENTIAL_TYPES = [SNMP_CREDENTIAL_TYPE];

export const EMAIL_CREDENTIAL_TYPES = [
  SMIME_CREDENTIAL_TYPE,
  PGP_CREDENTIAL_TYPE,
];

export const VFIRE_CREDENTIAL_TYPES = [USERNAME_PASSWORD_CREDENTIAL_TYPE];

export const ALL_CREDENTIAL_TYPES = [
  USERNAME_PASSWORD_CREDENTIAL_TYPE,
  USERNAME_SSH_KEY_CREDENTIAL_TYPE,
  CLIENT_CERTIFICATE_CREDENTIAL_TYPE,
  SNMP_CREDENTIAL_TYPE,
  SMIME_CREDENTIAL_TYPE,
  PGP_CREDENTIAL_TYPE,
  PASSWORD_ONLY_CREDENTIAL_TYPE,
];

export function parseCredentialType(credentialType) {
  if (credentialType === 'USERNAME_PASSWORD') {
    return USERNAME_PASSWORD_CREDENTIAL_TYPE;
  } else if (credentialType === 'USERNAME_SSH_KEY') {
    return USERNAME_SSH_KEY_CREDENTIAL_TYPE;
  } else if (credentialType === 'CLIENT_CERTIFICATE') {
    return CLIENT_CERTIFICATE_CREDENTIAL_TYPE;
  } else if (credentialType === 'SNMP') {
    return SNMP_CREDENTIAL_TYPE;
  } else if (credentialType === 'SMIME_CERTIFICATE') {
    return SMIME_CREDENTIAL_TYPE;
  } else if (credentialType === 'PGP_ENCRYPTION_KEY') {
    return PGP_CREDENTIAL_TYPE;
  } else if (credentialType === 'PASSWORD_ONLY') {
    return PASSWORD_ONLY_CREDENTIAL_TYPE;
  }
  return _('Unknown type ({{type}})', {type: credentialType});
}

export function convertCredentialTypeEnum(credentialType) {
  if (credentialType === 'up') {
    return 'USERNAME_PASSWORD';
  } else if (credentialType === 'usk') {
    return 'USERNAME_SSH_KEY';
  } else if (credentialType === 'cc') {
    return 'CLIENT_CERTIFICATE';
  } else if (credentialType === 'snmp') {
    return 'SNMP';
  } else if (credentialType === 'smime') {
    return 'SMIME_CERTIFICATE';
  } else if (credentialType === 'pgp') {
    return 'PGP_ENCRYPTION_KEY';
  } else if (credentialType === 'pw') {
    return 'PASSWORD_ONLY';
  }
  return null;
}

export function convertAuthAlgorithmEnum(authAlgorithm) {
  if (authAlgorithm === 'md5') {
    return 'MD5';
  } else if (authAlgorithm === 'sha1') {
    return 'SHA1';
  }
  return null;
}

export function convertPrivacyAlgorithmEnum(privacyAlgorithm) {
  if (privacyAlgorithm === 'aes') {
    return 'AES';
  } else if (privacyAlgorithm === 'des') {
    return 'DES';
  }
  return null;
}

export const ssh_credential_filter = credential =>
  credential.credential_type === USERNAME_SSH_KEY_CREDENTIAL_TYPE ||
  credential.credential_type === USERNAME_PASSWORD_CREDENTIAL_TYPE;

export const smb_credential_filter = credential =>
  credential.credential_type === USERNAME_PASSWORD_CREDENTIAL_TYPE;

export const esxi_credential_filter = credential =>
  credential.credential_type === USERNAME_PASSWORD_CREDENTIAL_TYPE;

export const snmp_credential_filter = credential =>
  credential.credential_type === SNMP_CREDENTIAL_TYPE;

export const email_credential_filter = credential =>
  credential.credential_type === SMIME_CREDENTIAL_TYPE ||
  credential.credential_type === PGP_CREDENTIAL_TYPE;

export const password_only_credential_filter = credential =>
  credential.credential_type === PASSWORD_ONLY_CREDENTIAL_TYPE;

export const vFire_credential_filter = credential =>
  credential.credential_type === USERNAME_PASSWORD_CREDENTIAL_TYPE;

export const SNMP_AUTH_ALGORITHM_MD5 = 'md5';
export const SNMP_AUTH_ALGORITHM_SHA1 = 'sha1';

export const SNMP_PRIVACY_ALOGRITHM_NONE = '';
export const SNMP_PRIVACY_ALGORITHM_AES = 'aes';
export const SNMP_PRIVACY_ALGORITHM_DES = 'des';

export const CERTIFICATE_STATUS_INACTIVE = 'inactive';
export const CERTIFICATE_STATUS_EXPIRED = 'expired';

const TYPE_NAMES = {
  up: _l('Username + Password'),
  usk: _l('Username + SSH Key'),
  cc: _l('Client Certificate'),
  snmp: _l('SNMP'),
  pgp: _l('PGP Encryption Key'),
  pw: _l('Password only'),
  smime: _l('S/MIME Certificate'),
};

export const getCredentialTypeName = type => `${TYPE_NAMES[type]}`;

class Credential extends Model {
  static entityType = 'credential';

  static parseObject(object) {
    const copy = super.parseObject(object);

    copy.credential_type = parseCredentialType(object.type);

    copy.allow_insecure = parseBoolean(object.allow_insecure);

    // TODO for detailspage: parse certificate_info, targets, scanners

    return copy;
  }

  static parseElement(element) {
    const ret = super.parseElement(element);

    if (isDefined(ret.certificate_info)) {
      ret.certificate_info.activationTime = parseDate(
        ret.certificate_info.activation_time,
      );
      ret.certificate_info.expirationTime = parseDate(
        ret.certificate_info.expiration_time,
      );
      delete ret.certificate_info.activation_time;
      delete ret.certificate_info.expiration_time;
    }

    ret.credential_type = element.type;

    ret.allow_insecure = parseYesNo(element.allow_insecure);

    if (isDefined(element.targets)) {
      ret.targets = map(element.targets.target, target =>
        parseModelFromElement(target, 'target'),
      );
    } else {
      ret.targets = [];
    }

    if (isDefined(element.scanners)) {
      ret.scanners = map(element.scanners.scanner, scanner =>
        parseModelFromElement(scanner, 'scanner'),
      );
    }

    return ret;
  }

  isAllowInsecure() {
    return this.allow_insecure !== NO_VALUE;
  }
}

export default Credential;

// vim: set ts=2 sw=2 tw=80:

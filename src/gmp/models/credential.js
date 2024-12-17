/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {_l} from 'gmp/locale/lang';
import Model, {parseModelFromElement} from 'gmp/model';
import {parseYesNo, NO_VALUE, parseDate} from 'gmp/parser';
import {map} from 'gmp/utils/array';
import {isDefined} from 'gmp/utils/identity';

export const USERNAME_PASSWORD_CREDENTIAL_TYPE = 'up';
export const USERNAME_SSH_KEY_CREDENTIAL_TYPE = 'usk';
export const SNMP_CREDENTIAL_TYPE = 'snmp';
export const SMIME_CREDENTIAL_TYPE = 'smime';
export const PGP_CREDENTIAL_TYPE = 'pgp';
export const PASSWORD_ONLY_CREDENTIAL_TYPE = 'pw';

export const SSH_CREDENTIAL_TYPES = [
  USERNAME_PASSWORD_CREDENTIAL_TYPE,
  USERNAME_SSH_KEY_CREDENTIAL_TYPE,
];

export const SSH_ELEVATE_CREDENTIAL_TYPES = [USERNAME_PASSWORD_CREDENTIAL_TYPE];

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
  SNMP_CREDENTIAL_TYPE,
  SMIME_CREDENTIAL_TYPE,
  PGP_CREDENTIAL_TYPE,
  PASSWORD_ONLY_CREDENTIAL_TYPE,
];

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

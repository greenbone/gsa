/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {_l} from 'gmp/locale/lang';
import {Date} from 'gmp/models/date';
import Model, {ModelElement, ModelProperties} from 'gmp/models/model';
import {parseYesNo, NO_VALUE, parseDate, YesNo} from 'gmp/parser';
import {map} from 'gmp/utils/array';
import {isDefined} from 'gmp/utils/identity';

export const USERNAME_PASSWORD_CREDENTIAL_TYPE = 'up';
export const USERNAME_SSH_KEY_CREDENTIAL_TYPE = 'usk';
export const SNMP_CREDENTIAL_TYPE = 'snmp';
export const SMIME_CREDENTIAL_TYPE = 'smime';
export const PGP_CREDENTIAL_TYPE = 'pgp';
export const PASSWORD_ONLY_CREDENTIAL_TYPE = 'pw';
export const CERTIFICATE_CREDENTIAL_TYPE = 'cc';
export const KRB5_CREDENTIAL_TYPE = 'krb5';

export const SSH_CREDENTIAL_TYPES = [
  USERNAME_PASSWORD_CREDENTIAL_TYPE,
  USERNAME_SSH_KEY_CREDENTIAL_TYPE,
];

export const SSH_ELEVATE_CREDENTIAL_TYPES = [USERNAME_PASSWORD_CREDENTIAL_TYPE];

export const SMB_CREDENTIAL_TYPES = [USERNAME_PASSWORD_CREDENTIAL_TYPE];

export const ESXI_CREDENTIAL_TYPES = [USERNAME_PASSWORD_CREDENTIAL_TYPE];

export const SNMP_CREDENTIAL_TYPES = [SNMP_CREDENTIAL_TYPE];

export const KRB5_CREDENTIAL_TYPES = [KRB5_CREDENTIAL_TYPE];

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
  KRB5_CREDENTIAL_TYPE,
] as const;

export const ssh_credential_filter = credential =>
  credential.credential_type === USERNAME_SSH_KEY_CREDENTIAL_TYPE ||
  credential.credential_type === USERNAME_PASSWORD_CREDENTIAL_TYPE;

export const smb_credential_filter = credential =>
  credential.credential_type === USERNAME_PASSWORD_CREDENTIAL_TYPE;

export const esxi_credential_filter = credential =>
  credential.credential_type === USERNAME_PASSWORD_CREDENTIAL_TYPE;

export const snmp_credential_filter = credential =>
  credential.credential_type === SNMP_CREDENTIAL_TYPE;

export const krb5CredentialFilter = credential =>
  credential.credential_type === KRB5_CREDENTIAL_TYPE;

export const email_credential_filter = credential =>
  credential.credential_type === SMIME_CREDENTIAL_TYPE ||
  credential.credential_type === PGP_CREDENTIAL_TYPE;

export const password_only_credential_filter = credential =>
  credential.credential_type === PASSWORD_ONLY_CREDENTIAL_TYPE;

export const vFire_credential_filter = credential =>
  credential.credential_type === USERNAME_PASSWORD_CREDENTIAL_TYPE;

export const SNMP_AUTH_ALGORITHM_MD5 = 'md5';
export const SNMP_AUTH_ALGORITHM_SHA1 = 'sha1';

export const SNMP_PRIVACY_ALGORITHM_NONE = '';
export const SNMP_PRIVACY_ALGORITHM_AES = 'aes';
export const SNMP_PRIVACY_ALGORITHM_DES = 'des';

export const CERTIFICATE_STATUS_INACTIVE = 'inactive';
export const CERTIFICATE_STATUS_EXPIRED = 'expired';

const TYPE_NAMES = {
  [USERNAME_PASSWORD_CREDENTIAL_TYPE]: _l('Username + Password'),
  [USERNAME_SSH_KEY_CREDENTIAL_TYPE]: _l('Username + SSH Key'),
  [CERTIFICATE_CREDENTIAL_TYPE]: _l('Client Certificate'),
  [SNMP_CREDENTIAL_TYPE]: _l('SNMP'),
  [PGP_CREDENTIAL_TYPE]: _l('PGP Encryption Key'),
  [PASSWORD_ONLY_CREDENTIAL_TYPE]: _l('Password only'),
  [SMIME_CREDENTIAL_TYPE]: _l('S/MIME Certificate'),
  [KRB5_CREDENTIAL_TYPE]: _l('SMB (Kerberos)'),
} as const;

export const getCredentialTypeName = (type: CredentialType) =>
  `${TYPE_NAMES[type]}`;

type CredentialType =
  | typeof CERTIFICATE_CREDENTIAL_TYPE
  | typeof KRB5_CREDENTIAL_TYPE
  | typeof PASSWORD_ONLY_CREDENTIAL_TYPE
  | typeof PGP_CREDENTIAL_TYPE
  | typeof SMIME_CREDENTIAL_TYPE
  | typeof SNMP_CREDENTIAL_TYPE
  | typeof USERNAME_PASSWORD_CREDENTIAL_TYPE
  | typeof USERNAME_SSH_KEY_CREDENTIAL_TYPE;

interface CredentialElement extends ModelElement {
  certificate_info?: {
    activation_time?: string;
    expiration_time?: string;
  };
  credential_type?: CredentialType;
  allow_insecure?: number;
  kdcs?: {
    kdc: string | string[];
  };
  targets?: {
    target?: ModelElement | ModelElement[];
  };
  scanners?: {
    scanner?: ModelElement | ModelElement[];
  };
}

interface CertificateInfo {
  activationTime?: Date;
  expirationTime?: Date;
}

interface CredentialProperties extends ModelProperties {
  allow_insecure?: YesNo;
  certificate_info?: CertificateInfo;
  credential_type?: CredentialType;
  kdcs?: string[];
  targets?: Model[];
  scanners?: Model[];
}

class Credential extends Model {
  static entityType = 'credential';

  readonly allow_insecure?: YesNo;
  readonly certificate_info?: CertificateInfo;
  readonly credential_type?: CredentialType;
  readonly kdcs?: string[];
  readonly targets: Model[];
  readonly scanners: Model[];

  constructor({
    // eslint-disable-next-line @typescript-eslint/naming-convention
    allow_insecure,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    certificate_info,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    credential_type,
    kdcs,
    targets = [],
    scanners = [],
    ...properties
  }: CredentialProperties = {}) {
    super(properties);
    this.allow_insecure = allow_insecure;
    this.certificate_info = certificate_info;
    this.credential_type = credential_type;
    this.kdcs = kdcs;
    this.targets = targets;
    this.scanners = scanners;
  }

  static fromElement(element: CredentialElement = {}): Credential {
    return new Credential(this.parseElement(element));
  }

  static parseElement(element: CredentialElement = {}): CredentialProperties {
    const ret = super.parseElement(element) as CredentialProperties;

    if (isDefined(element.certificate_info)) {
      ret.certificate_info = {
        activationTime: parseDate(element.certificate_info.activation_time),
        expirationTime: parseDate(element.certificate_info.expiration_time),
      };
    }

    ret.credential_type = element.type as CredentialType;

    ret.allow_insecure = parseYesNo(element.allow_insecure);

    if (element.type === KRB5_CREDENTIAL_TYPE) {
      const kdcsRaw = element.kdcs;
      if (kdcsRaw && 'kdc' in kdcsRaw) {
        ret.kdcs = Array.isArray(kdcsRaw.kdc) ? kdcsRaw.kdc : [kdcsRaw.kdc];
      } else {
        ret.kdcs = [];
      }
    } else {
      delete ret.kdcs;
    }

    ret.targets = map(element.targets?.target, target =>
      Model.fromElement(target, 'target'),
    );
    ret.scanners = map(element.scanners?.scanner, scanner =>
      Model.fromElement(scanner, 'scanner'),
    );

    return ret;
  }

  isAllowInsecure() {
    return this.allow_insecure !== NO_VALUE;
  }
}

export default Credential;

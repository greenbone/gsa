/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {_l} from 'gmp/locale/lang';
import {type Date} from 'gmp/models/date';
import Model, {type ModelElement, type ModelProperties} from 'gmp/models/model';
import {parseDate} from 'gmp/parser';
import {map} from 'gmp/utils/array';
import {isDefined} from 'gmp/utils/identity';

export type CredentialType =
  | typeof CERTIFICATE_CREDENTIAL_TYPE
  | typeof KRB5_CREDENTIAL_TYPE
  | typeof PASSWORD_ONLY_CREDENTIAL_TYPE
  | typeof PGP_CREDENTIAL_TYPE
  | typeof SMIME_CREDENTIAL_TYPE
  | typeof SNMP_CREDENTIAL_TYPE
  | typeof USERNAME_PASSWORD_CREDENTIAL_TYPE
  | typeof USERNAME_SSH_KEY_CREDENTIAL_TYPE
  | typeof CREDENTIAL_STORE_USERNAME_PASSWORD_CREDENTIAL_TYPE
  | typeof CREDENTIAL_STORE_USERNAME_SSH_KEY_CREDENTIAL_TYPE
  | typeof CREDENTIAL_STORE_CERTIFICATE_CREDENTIAL_TYPE
  | typeof CREDENTIAL_STORE_SNMP_CREDENTIAL_TYPE
  | typeof CREDENTIAL_STORE_PGP_CREDENTIAL_TYPE
  | typeof CREDENTIAL_STORE_PASSWORD_ONLY_CREDENTIAL_TYPE
  | typeof CREDENTIAL_STORE_SMIME_CREDENTIAL_TYPE
  | typeof CREDENTIAL_STORE_KRB5_CREDENTIAL_TYPE;

export type CertificateStatus =
  | typeof CERTIFICATE_STATUS_EXPIRED
  | typeof CERTIFICATE_STATUS_INACTIVE
  | typeof CERTIFICATE_STATUS_VALID
  | typeof CERTIFICATE_STATUS_UNKNOWN;

export type SNMPAuthAlgorithmType =
  | typeof SNMP_AUTH_ALGORITHM_MD5
  | typeof SNMP_AUTH_ALGORITHM_SHA1;

export type SNMPPrivacyAlgorithmType =
  | typeof SNMP_PRIVACY_ALGORITHM_NONE
  | typeof SNMP_PRIVACY_ALGORITHM_AES
  | typeof SNMP_PRIVACY_ALGORITHM_DES;

interface CredentialElement extends ModelElement {
  certificate_info?: {
    activation_time?: string;
    expiration_time?: string;
    issuer?: string;
    md5_fingerprint?: string;
    sha256_fingerprint?: string;
    subject?: string;
    serial?: string;
    time_status?: string;
  };
  credential_type?: CredentialType;
  credential_store?: {
    host_identifier?: string;
    vault_id?: string;
  };
  kdcs?: {
    kdc: string | string[];
  };
  login?: string;
  realm?: string;
  targets?: {
    target?: ModelElement | ModelElement[];
  };
  scanners?: {
    scanner?: ModelElement | ModelElement[];
  };
}

export interface CertificateInfo {
  activationTime?: Date;
  expirationTime?: Date;
  timeStatus?: CertificateStatus;
  issuer?: string;
  subject?: string;
  serial?: string;
  md5Fingerprint?: string;
  sha256Fingerprint?: string;
}

export interface CredentialStore {
  hostIdentifier?: string;
  vaultId?: string;
}

interface CredentialProperties extends ModelProperties {
  certificateInfo?: CertificateInfo;
  credentialStore?: CredentialStore;
  credentialType?: CredentialType;
  kdcs?: string[];
  login?: string;
  realm?: string;
  targets?: Model[];
  scanners?: Model[];
}

export const USERNAME_PASSWORD_CREDENTIAL_TYPE = 'up';
export const USERNAME_SSH_KEY_CREDENTIAL_TYPE = 'usk';
export const SNMP_CREDENTIAL_TYPE = 'snmp';
export const SMIME_CREDENTIAL_TYPE = 'smime';
export const PGP_CREDENTIAL_TYPE = 'pgp';
export const PASSWORD_ONLY_CREDENTIAL_TYPE = 'pw';
export const CERTIFICATE_CREDENTIAL_TYPE = 'cc';
export const KRB5_CREDENTIAL_TYPE = 'krb5';

// Credential Store credential types
export const CREDENTIAL_STORE_USERNAME_PASSWORD_CREDENTIAL_TYPE = 'cs_up';
export const CREDENTIAL_STORE_USERNAME_SSH_KEY_CREDENTIAL_TYPE = 'cs_usk';
export const CREDENTIAL_STORE_CERTIFICATE_CREDENTIAL_TYPE = 'cs_cc';
export const CREDENTIAL_STORE_SNMP_CREDENTIAL_TYPE = 'cs_snmp';
export const CREDENTIAL_STORE_PGP_CREDENTIAL_TYPE = 'cs_pgp';
export const CREDENTIAL_STORE_PASSWORD_ONLY_CREDENTIAL_TYPE = 'cs_pw';
export const CREDENTIAL_STORE_SMIME_CREDENTIAL_TYPE = 'cs_smime';
export const CREDENTIAL_STORE_KRB5_CREDENTIAL_TYPE = 'cs_krb5';

export const SSH_CREDENTIAL_TYPES: readonly CredentialType[] = [
  USERNAME_PASSWORD_CREDENTIAL_TYPE,
  USERNAME_SSH_KEY_CREDENTIAL_TYPE,
];

export const SSH_ELEVATE_CREDENTIAL_TYPES: readonly CredentialType[] = [
  USERNAME_PASSWORD_CREDENTIAL_TYPE,
];

export const SMB_CREDENTIAL_TYPES: readonly CredentialType[] = [
  USERNAME_PASSWORD_CREDENTIAL_TYPE,
];

export const ESXI_CREDENTIAL_TYPES: readonly CredentialType[] = [
  USERNAME_PASSWORD_CREDENTIAL_TYPE,
];

export const SNMP_CREDENTIAL_TYPES: readonly CredentialType[] = [
  SNMP_CREDENTIAL_TYPE,
];

export const KRB5_CREDENTIAL_TYPES: readonly CredentialType[] = [
  KRB5_CREDENTIAL_TYPE,
];

export const EMAIL_CREDENTIAL_TYPES: readonly CredentialType[] = [
  SMIME_CREDENTIAL_TYPE,
  PGP_CREDENTIAL_TYPE,
];

export const VFIRE_CREDENTIAL_TYPES: readonly CredentialType[] = [
  USERNAME_PASSWORD_CREDENTIAL_TYPE,
];

export const CREDENTIAL_STORE_CREDENTIAL_TYPES: readonly CredentialType[] = [
  CREDENTIAL_STORE_USERNAME_PASSWORD_CREDENTIAL_TYPE,
  CREDENTIAL_STORE_USERNAME_SSH_KEY_CREDENTIAL_TYPE,
  CREDENTIAL_STORE_CERTIFICATE_CREDENTIAL_TYPE,
  CREDENTIAL_STORE_SNMP_CREDENTIAL_TYPE,
  CREDENTIAL_STORE_PGP_CREDENTIAL_TYPE,
  CREDENTIAL_STORE_PASSWORD_ONLY_CREDENTIAL_TYPE,
  CREDENTIAL_STORE_SMIME_CREDENTIAL_TYPE,
  CREDENTIAL_STORE_KRB5_CREDENTIAL_TYPE,
];

export const ALL_CREDENTIAL_TYPES: readonly CredentialType[] = [
  USERNAME_PASSWORD_CREDENTIAL_TYPE,
  USERNAME_SSH_KEY_CREDENTIAL_TYPE,
  SNMP_CREDENTIAL_TYPE,
  SMIME_CREDENTIAL_TYPE,
  PGP_CREDENTIAL_TYPE,
  PASSWORD_ONLY_CREDENTIAL_TYPE,
  CERTIFICATE_CREDENTIAL_TYPE,
  KRB5_CREDENTIAL_TYPE,
  CREDENTIAL_STORE_USERNAME_PASSWORD_CREDENTIAL_TYPE,
  CREDENTIAL_STORE_USERNAME_SSH_KEY_CREDENTIAL_TYPE,
  CREDENTIAL_STORE_CERTIFICATE_CREDENTIAL_TYPE,
  CREDENTIAL_STORE_SNMP_CREDENTIAL_TYPE,
  CREDENTIAL_STORE_PGP_CREDENTIAL_TYPE,
  CREDENTIAL_STORE_PASSWORD_ONLY_CREDENTIAL_TYPE,
  CREDENTIAL_STORE_SMIME_CREDENTIAL_TYPE,
  CREDENTIAL_STORE_KRB5_CREDENTIAL_TYPE,
];

export const ssh_credential_filter = (credential: Credential) =>
  credential.credentialType === USERNAME_SSH_KEY_CREDENTIAL_TYPE ||
  credential.credentialType === USERNAME_PASSWORD_CREDENTIAL_TYPE;

export const smb_credential_filter = (credential: Credential) =>
  credential.credentialType === USERNAME_PASSWORD_CREDENTIAL_TYPE;

export const esxi_credential_filter = (credential: Credential) =>
  credential.credentialType === USERNAME_PASSWORD_CREDENTIAL_TYPE;

export const snmp_credential_filter = (credential: Credential) =>
  credential.credentialType === SNMP_CREDENTIAL_TYPE;

export const krb5CredentialFilter = (credential: Credential) =>
  credential.credentialType === KRB5_CREDENTIAL_TYPE;

export const email_credential_filter = (credential: Credential) =>
  credential.credentialType === SMIME_CREDENTIAL_TYPE ||
  credential.credentialType === PGP_CREDENTIAL_TYPE;

export const password_only_credential_filter = (credential: Credential) =>
  credential.credentialType === PASSWORD_ONLY_CREDENTIAL_TYPE;

export const vFire_credential_filter = (credential: Credential) =>
  credential.credentialType === USERNAME_PASSWORD_CREDENTIAL_TYPE;

export const SNMP_AUTH_ALGORITHM_MD5 = 'md5';
export const SNMP_AUTH_ALGORITHM_SHA1 = 'sha1';

export const SNMP_PRIVACY_ALGORITHM_NONE = '';
export const SNMP_PRIVACY_ALGORITHM_AES = 'aes';
export const SNMP_PRIVACY_ALGORITHM_DES = 'des';

export const CERTIFICATE_STATUS_INACTIVE = 'inactive';
export const CERTIFICATE_STATUS_EXPIRED = 'expired';
export const CERTIFICATE_STATUS_VALID = 'valid';
export const CERTIFICATE_STATUS_UNKNOWN = 'unknown';

const TYPE_NAMES = {
  [USERNAME_PASSWORD_CREDENTIAL_TYPE]: _l('Username + Password'),
  [USERNAME_SSH_KEY_CREDENTIAL_TYPE]: _l('Username + SSH Key'),
  [CERTIFICATE_CREDENTIAL_TYPE]: _l('Client Certificate'),
  [SNMP_CREDENTIAL_TYPE]: _l('SNMP'),
  [PGP_CREDENTIAL_TYPE]: _l('PGP Encryption Key'),
  [PASSWORD_ONLY_CREDENTIAL_TYPE]: _l('Password only'),
  [SMIME_CREDENTIAL_TYPE]: _l('S/MIME Certificate'),
  [KRB5_CREDENTIAL_TYPE]: _l('SMB (Kerberos)'),
  [CREDENTIAL_STORE_USERNAME_PASSWORD_CREDENTIAL_TYPE]: _l(
    'Credential Store Username + Password',
  ),
  [CREDENTIAL_STORE_USERNAME_SSH_KEY_CREDENTIAL_TYPE]: _l(
    'Credential Store Username + SSH Key',
  ),
  [CREDENTIAL_STORE_CERTIFICATE_CREDENTIAL_TYPE]: _l(
    'Credential Store Client Certificate',
  ),
  [CREDENTIAL_STORE_SNMP_CREDENTIAL_TYPE]: _l('Credential Store SNMP'),
  [CREDENTIAL_STORE_PGP_CREDENTIAL_TYPE]: _l(
    'Credential Store PGP Encryption Key',
  ),
  [CREDENTIAL_STORE_PASSWORD_ONLY_CREDENTIAL_TYPE]: _l(
    'Credential Store Password only',
  ),
  [CREDENTIAL_STORE_SMIME_CREDENTIAL_TYPE]: _l(
    'Credential Store S/MIME Certificate',
  ),
  [CREDENTIAL_STORE_KRB5_CREDENTIAL_TYPE]: _l(
    'Credential Store SMB (Kerberos)',
  ),
} as const;

export const getCredentialTypeName = (type: CredentialType) =>
  `${TYPE_NAMES[type]}`;

const parseTimeStatus = (
  status: string | undefined,
): CertificateStatus | undefined => {
  if (!isDefined(status)) {
    return undefined;
  }
  switch (status) {
    case CERTIFICATE_STATUS_EXPIRED:
    case CERTIFICATE_STATUS_INACTIVE:
    case CERTIFICATE_STATUS_VALID:
      return status;
    default:
      return CERTIFICATE_STATUS_UNKNOWN;
  }
};

class Credential extends Model {
  static readonly entityType = 'credential';

  readonly certificateInfo?: CertificateInfo;
  readonly credentialStore?: CredentialStore;
  readonly credentialType?: CredentialType;
  readonly kdcs: string[];
  readonly login?: string;
  readonly realm?: string;
  readonly targets: Model[];
  readonly scanners: Model[];

  constructor({
    certificateInfo,
    credentialStore,
    credentialType,
    kdcs = [],
    login,
    realm,
    targets = [],
    scanners = [],
    ...properties
  }: CredentialProperties = {}) {
    super(properties);
    this.certificateInfo = certificateInfo;
    this.credentialStore = credentialStore;
    this.credentialType = credentialType;
    this.kdcs = kdcs;
    this.login = login;
    this.realm = realm;
    this.targets = targets;
    this.scanners = scanners;
  }

  static fromElement(element: CredentialElement = {}): Credential {
    return new Credential(this.parseElement(element));
  }

  static parseElement(element: CredentialElement = {}): CredentialProperties {
    const ret = super.parseElement(element) as CredentialProperties;

    if (isDefined(element.certificate_info)) {
      ret.certificateInfo = {
        activationTime: parseDate(element.certificate_info.activation_time),
        expirationTime: parseDate(element.certificate_info.expiration_time),
        issuer: element.certificate_info.issuer,
        subject: element.certificate_info.subject,
        serial: element.certificate_info.serial,
        md5Fingerprint: element.certificate_info.md5_fingerprint,
        sha256Fingerprint: element.certificate_info.sha256_fingerprint,
        timeStatus: parseTimeStatus(element.certificate_info.time_status),
      };
    }

    if (isDefined(element.credential_store)) {
      ret.credentialStore = {
        hostIdentifier: element.credential_store.host_identifier,
        vaultId: element.credential_store.vault_id,
      };
    }

    ret.credentialType = element.type as CredentialType;

    if (isDefined(element.kdcs?.kdc)) {
      ret.kdcs = Array.isArray(element.kdcs.kdc)
        ? element.kdcs.kdc
        : [element.kdcs.kdc];
    }

    if (isDefined(element.login)) {
      ret.login = element.login;
    }

    if (isDefined(element.realm)) {
      ret.realm = element.realm;
    }

    ret.targets = map(element.targets?.target, target =>
      Model.fromElement(target, 'target'),
    );
    ret.scanners = map(element.scanners?.scanner, scanner =>
      Model.fromElement(scanner, 'scanner'),
    );

    return ret;
  }
}

export default Credential;

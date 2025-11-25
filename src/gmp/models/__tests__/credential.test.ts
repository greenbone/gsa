/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {setLocale} from 'gmp/locale/lang';
import Credential, {
  SNMP_CREDENTIAL_TYPE,
  USERNAME_PASSWORD_CREDENTIAL_TYPE,
  USERNAME_SSH_KEY_CREDENTIAL_TYPE,
  KRB5_CREDENTIAL_TYPE,
  esxi_credential_filter,
  smb_credential_filter,
  snmp_credential_filter,
  ssh_credential_filter,
  email_credential_filter,
  krb5CredentialFilter,
  SMIME_CREDENTIAL_TYPE,
  PGP_CREDENTIAL_TYPE,
  getCredentialTypeName,
} from 'gmp/models/credential';
import Model from 'gmp/models/model';
import {testModel} from 'gmp/models/testing';
import {parseDate} from 'gmp/parser';

const USERNAME_PASSWORD_CREDENTIAL = Credential.fromElement({
  type: USERNAME_PASSWORD_CREDENTIAL_TYPE,
});
const USERNAME_SSH_KEY_CREDENTIAL = Credential.fromElement({
  type: USERNAME_SSH_KEY_CREDENTIAL_TYPE,
});
const SNMP_CREDENTIAL = Credential.fromElement({type: SNMP_CREDENTIAL_TYPE});
const PGP_CREDENTIAL = Credential.fromElement({type: PGP_CREDENTIAL_TYPE});
const SMIME_CREDENTIAL = Credential.fromElement({type: SMIME_CREDENTIAL_TYPE});
const KRB5_CREDENTIAL = Credential.fromElement({type: KRB5_CREDENTIAL_TYPE});

const createAllCredentials = () => [
  USERNAME_PASSWORD_CREDENTIAL,
  USERNAME_SSH_KEY_CREDENTIAL,
  SNMP_CREDENTIAL,
  PGP_CREDENTIAL,
  SMIME_CREDENTIAL,
  KRB5_CREDENTIAL,
];

describe('Credential Model tests', () => {
  testModel(Credential, 'credential');

  test('should use defaults', () => {
    const credential = new Credential();
    expect(credential.certificateInfo).toBeUndefined();
    expect(credential.credentialType).toBeUndefined();
    expect(credential.targets).toEqual([]);
    expect(credential.scanners).toEqual([]);
    expect(credential.kdcs).toEqual([]);
    expect(credential.login).toBeUndefined();
    expect(credential.privacyAlgorithm).toBeUndefined();
    expect(credential.realm).toBeUndefined();
  });

  test('should parse empty element', () => {
    const credential = Credential.fromElement({});
    expect(credential.certificateInfo).toBeUndefined();
    expect(credential.credentialType).toBeUndefined();
    expect(credential.targets).toEqual([]);
    expect(credential.scanners).toEqual([]);
    expect(credential.kdcs).toEqual([]);
    expect(credential.login).toBeUndefined();
    expect(credential.privacyAlgorithm).toBeUndefined();
    expect(credential.realm).toBeUndefined();
  });

  test('should parse certificate_info', () => {
    const credential = Credential.fromElement({
      certificate_info: {
        activation_time: '2018-10-10T11:41:23.022Z',
        expiration_time: '2019-10-10T11:41:23.022Z',
        issuer: 'Some Issuer',
        subject: 'Some Subject',
        serial: '1234567890',
        md5_fingerprint: 'md5-fingerprint',
        sha256_fingerprint: 'sha256-fingerprint',
        time_status: 'valid',
      },
    });

    expect(credential.certificateInfo?.activationTime).toEqual(
      parseDate('2018-10-10T11:41:23.022Z'),
    );
    expect(credential.certificateInfo?.expirationTime).toEqual(
      parseDate('2019-10-10T11:41:23.022Z'),
    );
    expect(credential.certificateInfo?.issuer).toEqual('Some Issuer');
    expect(credential.certificateInfo?.subject).toEqual('Some Subject');
    expect(credential.certificateInfo?.serial).toEqual('1234567890');
    expect(credential.certificateInfo?.md5Fingerprint).toEqual(
      'md5-fingerprint',
    );
    expect(credential.certificateInfo?.sha256Fingerprint).toEqual(
      'sha256-fingerprint',
    );
    expect(credential.certificateInfo?.timeStatus).toEqual('valid');
  });

  test('should parse type', () => {
    const credential = Credential.fromElement({type: 'foo'});

    expect(credential.credentialType).toEqual('foo');
  });

  test('should parse targets', () => {
    const credential = Credential.fromElement({
      targets: {
        target: {_id: 't1'},
      },
    });

    expect(credential.targets.length).toEqual(1);
    const [target] = credential.targets;
    expect(target.id).toEqual('t1');
    expect(target.entityType).toEqual('target');
  });

  test('should parse scanners', () => {
    const credential = Credential.fromElement({
      scanners: {
        scanner: {_id: 's1'},
      },
    });
    expect(credential.scanners.length).toEqual(1);
    const [scanner] = credential.scanners;
    expect(scanner).toBeInstanceOf(Model);
    expect(scanner.id).toEqual('s1');
    expect(scanner.entityType).toEqual('scanner');
  });
});

describe('Credential model function tests', () => {
  test('ssh_credential_filter should return filter with correct true/false', () => {
    expect(ssh_credential_filter(USERNAME_SSH_KEY_CREDENTIAL)).toEqual(true);
    expect(ssh_credential_filter(USERNAME_PASSWORD_CREDENTIAL)).toEqual(true);
  });

  test('smb_credential_filter should return filter with correct true/false', () => {
    expect(smb_credential_filter(SNMP_CREDENTIAL)).toEqual(false);
    expect(smb_credential_filter(USERNAME_PASSWORD_CREDENTIAL)).toEqual(true);
  });

  test('esxi_credential_filter should return filter with correct true/false', () => {
    expect(esxi_credential_filter(SNMP_CREDENTIAL)).toEqual(false);
    expect(esxi_credential_filter(USERNAME_PASSWORD_CREDENTIAL)).toEqual(true);
  });

  test('snmp_credential_filter should return filter with correct true/false', () => {
    expect(snmp_credential_filter(SNMP_CREDENTIAL)).toEqual(true);
  });

  test('email_credential_ilter should return filter with correct true/filter', () => {
    expect(email_credential_filter(PGP_CREDENTIAL)).toEqual(true);
    expect(email_credential_filter(SMIME_CREDENTIAL)).toEqual(true);
    expect(email_credential_filter(USERNAME_PASSWORD_CREDENTIAL)).toEqual(
      false,
    );
  });

  test('should filter non ssh credentials', () => {
    const allCredentials = createAllCredentials();
    expect(allCredentials.filter(ssh_credential_filter)).toEqual(
      expect.arrayContaining([
        USERNAME_PASSWORD_CREDENTIAL,
        USERNAME_SSH_KEY_CREDENTIAL,
      ]),
    );
  });

  test('should filter non smb credentials', () => {
    const allCredentials = createAllCredentials();
    expect(allCredentials.filter(smb_credential_filter)).toEqual([
      USERNAME_PASSWORD_CREDENTIAL,
    ]);
  });

  test('should filter non smb credentials', () => {
    const allCredentials = createAllCredentials();
    expect(allCredentials.filter(esxi_credential_filter)).toEqual([
      USERNAME_PASSWORD_CREDENTIAL,
    ]);
  });

  test('should filter non snmp credentials', () => {
    const allCredentials = createAllCredentials();
    expect(allCredentials.filter(snmp_credential_filter)).toEqual([
      SNMP_CREDENTIAL,
    ]);
  });

  test('should filter non email credentials', () => {
    const allCredentials = createAllCredentials();
    expect(allCredentials.filter(email_credential_filter)).toEqual([
      PGP_CREDENTIAL,
      SMIME_CREDENTIAL,
    ]);
  });

  test('should filter non krb5 credentials', () => {
    const allCredentials = createAllCredentials();
    expect(allCredentials.filter(krb5CredentialFilter)).toEqual([
      KRB5_CREDENTIAL,
    ]);
  });

  test('should parse kdcs', () => {
    const credential = Credential.fromElement({
      kdcs: {kdc: ['kdc1.example.com', 'kdc2.example.com']},
    });
    expect(credential.kdcs).toEqual(['kdc1.example.com', 'kdc2.example.com']);
  });

  test('should parse login', () => {
    const credential = Credential.fromElement({
      login: 'test-user',
    });
    expect(credential.login).toEqual('test-user');
  });

  test('should parse privacy_algorithm', () => {
    const credential = Credential.fromElement({
      privacy: {algorithm: 'aes'},
    });
    expect(credential.privacyAlgorithm).toEqual('aes');
  });

  test('should parse realm', () => {
    const credential = Credential.fromElement({
      realm: 'test-realm',
    });
    expect(credential.realm).toEqual('test-realm');
  });
});

describe('getCredentialTypeName tests', () => {
  setLocale('en');

  test('should display full name', () => {
    expect(getCredentialTypeName(USERNAME_PASSWORD_CREDENTIAL_TYPE)).toEqual(
      'Username + Password',
    );
    expect(getCredentialTypeName(USERNAME_SSH_KEY_CREDENTIAL_TYPE)).toEqual(
      'Username + SSH Key',
    );
    expect(getCredentialTypeName(SNMP_CREDENTIAL_TYPE)).toEqual('SNMP');
    expect(getCredentialTypeName(SMIME_CREDENTIAL_TYPE)).toEqual(
      'S/MIME Certificate',
    );
    expect(getCredentialTypeName(PGP_CREDENTIAL_TYPE)).toEqual(
      'PGP Encryption Key',
    );
    expect(getCredentialTypeName(KRB5_CREDENTIAL_TYPE)).toEqual(
      'SMB (Kerberos)',
    );
  });
});

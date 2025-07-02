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
import {parseDate, NO_VALUE, YES_VALUE} from 'gmp/parser';

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

testModel(Credential, 'credential');

describe('Credential Model tests', () => {
  test('should use defaults', () => {
    const credential = new Credential();
    expect(credential.allow_insecure).toBeUndefined();
    expect(credential.certificate_info).toBeUndefined();
    expect(credential.credential_type).toBeUndefined();
    expect(credential.targets).toEqual([]);
    expect(credential.scanners).toEqual([]);
    expect(credential.kdcs).toBeUndefined();
  });

  test('should parse empty element', () => {
    const credential = Credential.fromElement({});
    expect(credential.allow_insecure).toEqual(NO_VALUE);
    expect(credential.certificate_info).toBeUndefined();
    expect(credential.credential_type).toBeUndefined();
    expect(credential.targets).toEqual([]);
    expect(credential.scanners).toEqual([]);
    expect(credential.kdcs).toBeUndefined();
  });

  test('should parse certificate_info', () => {
    const elem = {
      certificate_info: {
        activation_time: '2018-10-10T11:41:23.022Z',
        expiration_time: '2019-10-10T11:41:23.022Z',
      },
    };
    const credential = Credential.fromElement(elem);

    expect(credential.certificate_info?.activationTime).toEqual(
      parseDate('2018-10-10T11:41:23.022Z'),
    );
    expect(credential.certificate_info?.expirationTime).toEqual(
      parseDate('2019-10-10T11:41:23.022Z'),
    );
  });

  test('should parse type', () => {
    const credential = Credential.fromElement({type: 'foo'});

    expect(credential.credential_type).toEqual('foo');
  });

  test('should parse allow insecure ', () => {
    const cred1 = Credential.fromElement({allow_insecure: 1});
    const cred2 = Credential.fromElement({allow_insecure: 0});

    expect(cred1.allow_insecure).toEqual(YES_VALUE);
    expect(cred2.allow_insecure).toEqual(NO_VALUE);
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

describe('Credential model method tests', () => {
  test('isAllowInsecure() should return correct true/false', () => {
    const cred1 = new Credential({allow_insecure: 0});
    const cred2 = new Credential({allow_insecure: 1});

    expect(cred1.isAllowInsecure()).toBe(false);
    expect(cred2.isAllowInsecure()).toBe(true);
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
  test('should parse kdcs array for kerberos credentials', () => {
    const credential = Credential.fromElement({
      type: KRB5_CREDENTIAL_TYPE,
      kdcs: {kdc: ['kdc1.example.com', 'kdc2.example.com']},
    });

    expect(credential.kdcs).toEqual(['kdc1.example.com', 'kdc2.example.com']);
  });

  test('should parse single kdc as array for kerberos credentials', () => {
    const credential = Credential.fromElement({
      type: KRB5_CREDENTIAL_TYPE,
      kdcs: {kdc: 'kdc1.example.com'},
    });

    expect(credential.kdcs).toEqual(['kdc1.example.com']);
  });

  test('should set empty kdcs array when no kdc field present in kerberos credentials', () => {
    const credential = Credential.fromElement({
      type: KRB5_CREDENTIAL_TYPE,
      kdcs: {},
    });

    expect(credential.kdcs).toEqual([]);
  });

  test('should not parse kdcs for non-kerberos credentials', () => {
    const credential = Credential.fromElement({
      type: USERNAME_PASSWORD_CREDENTIAL_TYPE,
      kdcs: {kdc: 'shouldBeIgnored.example.com'},
    });

    expect(credential.kdcs).toBeUndefined();
  });

  test('should not set kdcs if missing entirely', () => {
    const credential = Credential.fromElement({
      type: KRB5_CREDENTIAL_TYPE,
    });

    expect(credential.kdcs).toEqual([]);
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

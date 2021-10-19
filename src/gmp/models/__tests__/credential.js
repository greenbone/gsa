/* Copyright (C) 2018-2021 Greenbone Networks GmbH
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

/* eslint-disable max-len */

import {setLocale} from 'gmp/locale/lang';

import Model from 'gmp/model';

import Credential, {
  CLIENT_CERTIFICATE_CREDENTIAL_TYPE,
  SNMP_CREDENTIAL_TYPE,
  USERNAME_PASSWORD_CREDENTIAL_TYPE,
  USERNAME_SSH_KEY_CREDENTIAL_TYPE,
  esxi_credential_filter,
  smb_credential_filter,
  snmp_credential_filter,
  ssh_credential_filter,
  email_credential_filter,
  SMIME_CREDENTIAL_TYPE,
  PGP_CREDENTIAL_TYPE,
  getCredentialTypeName,
} from 'gmp/models/credential';

import {testModel} from 'gmp/models/testing';

import {parseDate, NO_VALUE, YES_VALUE} from 'gmp/parser';

const USERNAME_PASSWORD_CREDENTIAL = Credential.fromElement({
  type: USERNAME_PASSWORD_CREDENTIAL_TYPE,
});
const USERNAME_SSH_KEY_CREDENTIAL = Credential.fromElement({
  type: USERNAME_SSH_KEY_CREDENTIAL_TYPE,
});
const CLIENT_CERTIFICATE_CREDENTIAL = Credential.fromElement({
  type: CLIENT_CERTIFICATE_CREDENTIAL_TYPE,
});
const SNMP_CREDENTIAL = Credential.fromElement({type: SNMP_CREDENTIAL_TYPE});
const PGP_CREDENTIAL = Credential.fromElement({type: PGP_CREDENTIAL_TYPE});
const SMIME_CREDENTIAL = Credential.fromElement({type: SMIME_CREDENTIAL_TYPE});

const createAllCredentials = () => [
  CLIENT_CERTIFICATE_CREDENTIAL,
  USERNAME_PASSWORD_CREDENTIAL,
  USERNAME_SSH_KEY_CREDENTIAL,
  SNMP_CREDENTIAL,
  PGP_CREDENTIAL,
  SMIME_CREDENTIAL,
];

testModel(Credential, 'credential');

describe('Credential Model tests', () => {
  test('should parse certificate_info', () => {
    const elem = {
      certificate_info: {
        activation_time: '2018-10-10T11:41:23.022Z',
        expiration_time: '2019-10-10T11:41:23.022Z',
      },
    };
    const credential = Credential.fromElement(elem);

    expect(credential.certificate_info.activationTime).toEqual(
      parseDate('2018-10-10T11:41:23.022Z'),
    );
    expect(credential.certificate_info.expirationTime).toEqual(
      parseDate('2019-10-10T11:41:23.022Z'),
    );
    expect(credential.certificate_info.activation_time).toBeUndefined();
    expect(credential.certificate_info.expiration_time).toBeUndefined();
  });

  test('should parse type', () => {
    const credential = Credential.fromElement({type: 'foo'});

    expect(credential.credential_type).toEqual('foo');
  });

  test('should parse allow_insecure as Yes/No', () => {
    const elem1 = {allow_insecure: '1'};
    const elem2 = {allow_insecure: '0'};
    const cred1 = Credential.fromElement(elem1);
    const cred2 = Credential.fromElement(elem2);

    expect(cred1.allow_insecure).toEqual(YES_VALUE);
    expect(cred2.allow_insecure).toEqual(NO_VALUE);
  });

  test('should return given targets as array of instances of target model', () => {
    const elem = {
      targets: {
        target: {_id: 't1'},
      },
    };
    const credential = Credential.fromElement(elem);

    expect(credential.targets.length).toEqual(1);

    const [target] = credential.targets;
    expect(target).toBeInstanceOf(Model);
    expect(target.id).toEqual('t1');
    expect(target.entityType).toEqual('target');
  });

  test('should return empty array if no targets are given', () => {
    const credential = Credential.fromElement({});

    expect(credential.targets.length).toEqual(0);
    expect(credential.targets).toEqual([]);
  });

  test('should return given scanners as array of instances of scanner model', () => {
    const elem = {
      scanners: {
        scanner: {_id: 's1'},
      },
    };
    const credential = Credential.fromElement(elem);

    expect(credential.scanners.length).toEqual(1);

    const [scanner] = credential.scanners;
    expect(scanner).toBeInstanceOf(Model);
    expect(scanner.id).toEqual('s1');
    expect(scanner.entityType).toEqual('scanner');
  });

  test('isAllowInsecure() should return correct true/false', () => {
    const cred1 = Credential.fromElement({allow_insecure: '0'});
    const cred2 = Credential.fromElement({allow_insecure: '1'});

    expect(cred1.isAllowInsecure()).toBe(false);
    expect(cred2.isAllowInsecure()).toBe(true);
  });
});

describe('Credential model function tests', () => {
  test('ssh_credential_filter should return filter with correct true/false', () => {
    expect(ssh_credential_filter(CLIENT_CERTIFICATE_CREDENTIAL)).toEqual(false);
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
    expect(snmp_credential_filter(CLIENT_CERTIFICATE_CREDENTIAL)).toEqual(
      false,
    );
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
    expect(getCredentialTypeName(CLIENT_CERTIFICATE_CREDENTIAL_TYPE)).toEqual(
      'Client Certificate',
    );
    expect(getCredentialTypeName(SNMP_CREDENTIAL_TYPE)).toEqual('SNMP');
    expect(getCredentialTypeName(SMIME_CREDENTIAL_TYPE)).toEqual(
      'S/MIME Certificate',
    );
    expect(getCredentialTypeName(PGP_CREDENTIAL_TYPE)).toEqual(
      'PGP Encryption Key',
    );
  });
});

// vim: set ts=2 sw=2 tw=80:

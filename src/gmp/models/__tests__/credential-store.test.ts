/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {
  USERNAME_PASSWORD_CREDENTIAL_TYPE,
  USERNAME_SSH_KEY_CREDENTIAL_TYPE,
} from 'gmp/models/credential';
import CredentialStore from 'gmp/models/credential-store';
import {testModel} from 'gmp/models/testing';
import {YES_VALUE} from 'gmp/parser';

describe('CredentialStore model tests', () => {
  testModel(CredentialStore, 'credential');

  test('should use defaults', () => {
    const credentialStore = new CredentialStore();

    expect(credentialStore.id).toBeUndefined();
    expect(credentialStore.name).toBeUndefined();
    expect(credentialStore.comment).toBeUndefined();
    expect(credentialStore.entityType).toEqual('credential');
    expect(credentialStore.version).toBeUndefined();
    expect(credentialStore.host).toBeUndefined();
    expect(credentialStore.path).toBeUndefined();
    expect(credentialStore.port).toBeUndefined();
    expect(credentialStore.preferences).toEqual([]);
    expect(credentialStore.selectors).toEqual([]);
  });

  test('should parse version', () => {
    const credentialStore = CredentialStore.fromElement({version: '1.2.3'});
    expect(credentialStore.version).toEqual('1.2.3');
  });

  test('should parse host', () => {
    const credentialStore = CredentialStore.fromElement({host: 'example.com'});
    expect(credentialStore.host).toEqual('example.com');
  });

  test('should parse path', () => {
    const credentialStore = CredentialStore.fromElement({path: '/some/path'});
    expect(credentialStore.path).toEqual('/some/path');
  });

  test('should parse port', () => {
    const credentialStore = CredentialStore.fromElement({port: '8080'});
    expect(credentialStore.port).toEqual('8080');
  });

  test('should parse preferences', () => {
    const credentialStore = CredentialStore.fromElement({
      preferences: {
        preference: [
          {name: 'pref1', type: 'string', value: 'value1'},
          {name: 'pref2', type: 'password', _secret: YES_VALUE},
        ],
      },
    });
    expect(credentialStore.preferences).toEqual([
      {
        defaultValue: undefined,
        name: 'pref1',
        passphraseName: undefined,
        pattern: undefined,
        type: 'string',
        secret: false,
        value: 'value1',
      },
      {
        defaultValue: undefined,
        name: 'pref2',
        passphraseName: undefined,
        pattern: undefined,
        type: 'password',
        secret: true,
      },
    ]);
  });

  test('should parse selectors', () => {
    const credentialStore = CredentialStore.fromElement({
      selectors: {
        selector: [
          {
            name: 'selector1',
            credential_types: {
              credential_type: [
                USERNAME_PASSWORD_CREDENTIAL_TYPE,
                USERNAME_SSH_KEY_CREDENTIAL_TYPE,
              ],
            },
          },
          {
            name: 'selector2',
            pattern: 'some-pattern',
          },
        ],
      },
    });
    expect(credentialStore.selectors).toEqual([
      {
        name: 'selector1',
        credentialTypes: [
          USERNAME_PASSWORD_CREDENTIAL_TYPE,
          USERNAME_SSH_KEY_CREDENTIAL_TYPE,
        ],
      },
      {name: 'selector2', pattern: 'some-pattern', credentialTypes: []},
    ]);
  });
});

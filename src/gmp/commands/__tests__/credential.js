/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import Model from 'gmp/model';
import Credential from 'gmp/models/credential';
import {parseDate, NO_VALUE, YES_VALUE} from 'gmp/parser';

describe('Credential Model tests', () => {
  test('should parse certificate_info', () => {
    const elem = {
      certificate_info: {
        activation_time: '2025-02-10T11:41:23.022Z',
        expiration_time: '2025-10-10T11:41:23.022Z',
      },
    };
    const credential = Credential.fromElement(elem);

    expect(credential.certificate_info.activationTime).toEqual(
      parseDate('2025-02-10T11:41:23.022Z'),
    );
    expect(credential.certificate_info.expirationTime).toEqual(
      parseDate('2025-10-10T11:41:23.022Z'),
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

  test('isAllowInsecure() should return correct true/false', () => {
    const cred1 = Credential.fromElement({allow_insecure: '0'});
    const cred2 = Credential.fromElement({allow_insecure: '1'});

    expect(cred1.isAllowInsecure()).toBe(false);
    expect(cred2.isAllowInsecure()).toBe(true);
  });

  test('should parse targets as array of instances of target model', () => {
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

  test('should parse scanners as array of instances of scanner model', () => {
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
});

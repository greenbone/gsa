/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import Model from 'gmp/models/model';
import Permission from 'gmp/models/permission';
import {testModel} from 'gmp/models/testing';

testModel(Permission, 'permission');

describe('Permission model tests', () => {
  test('should use defaults', () => {
    const permission = new Permission();
    expect(permission.resource).toBeUndefined();
    expect(permission.subject).toBeUndefined();
  });

  test('should parse empty element', () => {
    const permission = Permission.fromElement();
    expect(permission.resource).toBeUndefined();
    expect(permission.subject).toBeUndefined();
  });

  test('should parse resource', () => {
    const permission = Permission.fromElement({
      resource: {
        _id: '123',
        type: 'alert',
      },
    });
    expect(permission.resource).toBeInstanceOf(Model);
    expect(permission.resource?.entityType).toEqual('alert');
    expect(permission.resource?.id).toEqual('123');

    const permission2 = Permission.fromElement({
      resource: {
        type: 'alert',
      },
    });
    expect(permission2.resource).toBeUndefined();
  });

  test('should parse subject as model of their type', () => {
    const permission = Permission.fromElement({
      subject: {
        _id: '123',
        type: 'group',
      },
    });
    expect(permission.subject).toBeInstanceOf(Model);
    expect(permission.subject?.id).toEqual('123');
    expect(permission.subject?.entityType).toEqual('group');

    const permission2 = Permission.fromElement({
      subject: {
        type: 'user',
      },
    });
    expect(permission2.subject).toBeUndefined();
  });
});

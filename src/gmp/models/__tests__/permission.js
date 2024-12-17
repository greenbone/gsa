/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import Model from 'gmp/model';
import Permission from 'gmp/models/permission';
import {testModel} from 'gmp/models/testing';

testModel(Permission, 'permission');

describe('Permission model tests', () => {
  test('should parse resource as model of their type', () => {
    const elem = {
      resource: {
        _id: '123',
        type: 'alert',
      },
    };
    const permission = Permission.fromElement(elem);

    expect(permission.resource).toBeInstanceOf(Model);
    expect(permission.resource.entityType).toEqual('alert');
    expect(permission.resource.id).toEqual('123');
  });

  test('should not parse resource if no id is given', () => {
    const elem = {
      resource: {
        type: 'alert',
      },
    };
    const permission = Permission.fromElement(elem);

    expect(permission.resource).toBeUndefined();
  });

  test('should parse subject as model of their type', () => {
    const elem = {
      subject: {
        _id: '123',
        type: 'alert',
      },
    };
    const permission = Permission.fromElement(elem);

    expect(permission.subject).toBeInstanceOf(Model);
    expect(permission.subject.id).toEqual('123');
    expect(permission.subject.entityType).toEqual('alert');
  });

  test('should not parse subject if no id is given', () => {
    const elem = {
      subject: {
        type: 'alert',
      },
    };
    const permission = Permission.fromElement(elem);

    expect(permission.subject).toBeUndefined();
  });
});

// vim: set ts=2 sw=2 tw=80:

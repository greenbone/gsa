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

import Model from 'gmp/model';
import Permission from 'gmp/models/permission';
import {testModel} from 'gmp/models/testing';

testModel(Permission, 'permission');

describe('Permission model parseObject tests', () => {
  test('should parse resource as model of their type', () => {
    const obj = {
      resource: {
        id: '123',
        type: 'alert',
      },
    };
    const permission = Permission.fromObject(obj);

    expect(permission.resource).toBeInstanceOf(Model);
    expect(permission.resource.entityType).toEqual('alert');
    expect(permission.resource.id).toEqual('123');
  });

  test('should not parse resource if no id is given', () => {
    const obj = {
      resource: {
        type: 'alert',
      },
    };
    const permission = Permission.fromObject(obj);

    expect(permission.resource).toBeUndefined();
  });

  test('should parse subject as model of their type', () => {
    const obj = {
      subject: {
        id: '123',
        type: 'alert',
      },
    };
    const permission = Permission.fromObject(obj);

    expect(permission.subject).toBeInstanceOf(Model);
    expect(permission.subject.id).toEqual('123');
    expect(permission.subject.entityType).toEqual('alert');
  });

  test('should not parse subject if no id is given', () => {
    const obj = {
      subject: {
        type: 'alert',
      },
    };
    const permission = Permission.fromObject(obj);

    expect(permission.subject).toBeUndefined();
  });
});

describe('Permission model parseElement tests', () => {
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

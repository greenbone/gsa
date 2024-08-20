/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';

import {ResourceName} from '../resourcename';

describe('ResourceName tests', () => {
  test('should init ResourceName data via constructor', () => {
    const resourceName = new ResourceName({
      id: '19c091f0-a687-4dc3-b482-7d191ead4bb3',
      name: 'Foo',
      type: 'task',
    });

    expect(resourceName.id).toEqual('19c091f0-a687-4dc3-b482-7d191ead4bb3');
    expect(resourceName.name).toEqual('Foo');
    expect(resourceName.type).toEqual('task');
  });

  test('should parse ResourceName data from element', () => {
    const resourceName = ResourceName.fromElement(
      {
        _id: '19c091f0-a687-4dc3-b482-7d191ead4bba',
        name: 'Bar',
      },
      'report',
    );

    expect(resourceName.id).toEqual('19c091f0-a687-4dc3-b482-7d191ead4bba');
    expect(resourceName.name).toEqual('Bar');
    expect(resourceName.type).toEqual('report');
  });

  test('should parse empty name and id', () => {
    const resourceName = ResourceName.fromElement({}, 'report');

    expect(resourceName.id).toEqual('');
    expect(resourceName.name).toEqual('');
    expect(resourceName.type).toEqual('report');
  });
});

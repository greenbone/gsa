/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import Tag from 'gmp/models/tag';
import {testModel} from 'gmp/models/testing';
import {type ApiType} from 'gmp/utils/entity-type';

describe('Tag model tests', () => {
  testModel(Tag, 'tag');

  test('should use defaults', () => {
    const tag = new Tag();
    expect(tag.resourceType).toBeUndefined();
    expect(tag.resourceCount).toEqual(0);
    expect(tag.value).toBeUndefined();
  });

  test('should parse empty element', () => {
    const tag = Tag.fromElement();
    expect(tag.resourceType).toBeUndefined();
    expect(tag.resourceCount).toEqual(0);
    expect(tag.value).toBeUndefined();
  });

  test.each([
    {resourceType: 'task', entityType: 'task'},
    {resourceType: 'report_format', entityType: 'reportformat'},
    {resourceType: 'os', entityType: 'operatingsystem'},
    {resourceType: 'config', entityType: 'scanconfig'},
  ])(
    'should parse resource type $resourceType',
    ({resourceType, entityType}) => {
      const tag = Tag.fromElement({
        resources: {
          type: resourceType as ApiType,
          count: {
            total: 42,
          },
        },
      });

      expect(tag.resourceType).toEqual(entityType);
      expect(tag.resourceCount).toEqual(42);
    },
  );

  test('should parse value', () => {
    const tag = Tag.fromElement({value: 'foo'});
    expect(tag.value).toEqual('foo');

    const tag2 = Tag.fromElement({value: 42});
    expect(tag2.value).toEqual('42');
  });
});

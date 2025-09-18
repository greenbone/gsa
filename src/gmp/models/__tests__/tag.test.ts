/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import Tag from 'gmp/models/tag';
import {testModel} from 'gmp/models/testing';

testModel(Tag, 'tag');

describe('Tag model tests', () => {
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

  test('should parse resources', () => {
    const tag = Tag.fromElement({
      resources: {
        type: 'task',
        count: {
          total: 42,
        },
      },
    });

    expect(tag.resourceType).toEqual('task');
    expect(tag.resourceCount).toEqual(42);

    const tag2 = Tag.fromElement({
      resources: {
        type: 'report_format',
        count: {
          total: 42,
        },
      },
    });

    expect(tag2.resourceType).toEqual('reportformat');
    expect(tag2.resourceCount).toEqual(42);
  });

  test('should parse value', () => {
    const tag = Tag.fromElement({value: 'foo'});
    expect(tag.value).toEqual('foo');

    const tag2 = Tag.fromElement({value: 42});
    expect(tag2.value).toEqual('42');
  });
});

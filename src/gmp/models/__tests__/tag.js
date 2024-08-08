/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';

import Tag from 'gmp/models/tag';

import {testModel} from 'gmp/models/testing';

testModel(Tag, 'tag');

describe('Tag model tests', () => {
  test('should parse resources', () => {
    const elem = {
      resources: {
        type: 'foo',
        count: {
          total: '42',
        },
      },
    };
    const tag = Tag.fromElement(elem);

    expect(tag.resourceType).toEqual('foo');
    expect(tag.resourceCount).toEqual(42);
  });

  test('should return count of 0 and no type if no resources are given', () => {
    const tag = Tag.fromElement({});

    expect(tag.resourceType).toBeUndefined();
    expect(tag.resourceCount).toEqual(0);
  });

  test('should parse value to undefined, if no value is given', () => {
    const tag = Tag.fromElement({});

    expect(tag.value).toBeUndefined();
  });

  test('should parse value', () => {
    const tag = Tag.fromElement({value: 'foo'});

    expect(tag.value).toEqual('foo');
  });
});

// vim: set ts=2 sw=2 tw=80:

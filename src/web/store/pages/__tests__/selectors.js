/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import getPage from 'web/store/pages/selectors';

describe('pages selectors tests', () => {
  test('should not crash for undefined state', () => {
    const selector = getPage();

    expect(selector.getFilter('foo')).toBeUndefined();
  });

  test('should not crash for empty state', () => {
    const selector = getPage({});

    expect(selector.getFilter('foo')).toBeUndefined();
  });

  test('should return undefined filter', () => {
    const selector = getPage({
      pages: {
        foo: {},
      },
    });

    expect(selector.getFilter('foo')).toBeUndefined();
  });

  test('should return valid filter', () => {
    const selector = getPage({
      pages: {
        foo: {
          filter: 'name=foo',
        },
      },
    });

    expect(selector.getFilter('foo')).toEqual('name=foo');
  });
});

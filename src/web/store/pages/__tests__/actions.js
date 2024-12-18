/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';

import {pageFilter, CHANGE_PAGE_FILTER} from '../actions';

describe('page actions tests', () => {
  describe('changeFilter action tests', () => {
    test('should create a page filter action for a page', () => {
      const action = pageFilter('foo', 'name~bar');

      expect(action).toEqual({
        type: CHANGE_PAGE_FILTER,
        page: 'foo',
        filter: 'name~bar',
      });
    });
  });
});

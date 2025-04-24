/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import Filter from 'gmp/models/filter';
import {filterString} from 'gmp/models/filter/utils';

describe('filterString function tests', () => {
  test('should return string for non Filter objects', () => {
    expect(filterString(1)).toEqual('1');
    expect(filterString('foo')).toEqual('foo');
    expect(filterString()).toEqual('undefined');
  });

  test('should return the filter string from Filters', () => {
    let filter = Filter.fromString('foo bar');
    expect(filterString(filter)).toEqual('foo bar');

    filter = Filter.fromString('name=foo and severity>1');
    expect(filterString(filter)).toEqual('name=foo and severity>1');
  });
});

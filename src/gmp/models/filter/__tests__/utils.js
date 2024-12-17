/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';

import Filter from '../../filter';
import {filter_string} from '../utils';

describe('filter_string function tests', () => {
  test('should return string for non Filter objects', () => {
    expect(filter_string(1)).toEqual('1');
    expect(filter_string('foo')).toEqual('foo');
    expect(filter_string()).toEqual('undefined');
  });

  test('should return the filter string from Filters', () => {
    let filter = Filter.fromString('foo bar');
    expect(filter_string(filter)).toEqual('foo bar');

    filter = Filter.fromString('name=foo and severity>1');
    expect(filter_string(filter)).toEqual('name=foo and severity>1');
  });
});

// vim: set ts=2 sw=2 tw=80:

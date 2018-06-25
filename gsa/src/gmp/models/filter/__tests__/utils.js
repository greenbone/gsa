/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2018 Greenbone Networks GmbH
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 */
import {filter_string} from '../utils';
import Filter from '../../filter';

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

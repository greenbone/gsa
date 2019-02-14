/* Copyright (C) 2018-2019 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
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
import {isFunction} from 'gmp/utils/identity';

import entitiesReducer from '../reducers';

const initState = {
  byId: {},
  errors: {},
  isLoading: {},
};

describe('entities reducer tests', () => {
  test('should be a function', () => {
    expect(isFunction(entitiesReducer)).toEqual(true);
  });

  test('should create initial state', () => {
    expect(entitiesReducer(undefined, {})).toEqual({
      agent: initState,
      alert: initState,
      certbund: initState,
      cpe: initState,
      credential: initState,
      cve: initState,
      deltaReport: initState,
      dfncert: initState,
      filter: initState,
      group: initState,
      host: initState,
      note: initState,
      nvt: initState,
      operatingsystem: initState,
      ovaldef: initState,
      override: initState,
      permission: initState,
      portlist: initState,
      reportformat: initState,
      report: initState,
      result: initState,
      role: initState,
      scanconfig: initState,
      scanner: initState,
      schedule: initState,
      secinfo: initState,
      tag: initState,
      target: initState,
      task: initState,
      ticket: initState,
      user: initState,
      vuln: initState,
    });
  });
});

// vim: set ts=2 sw=2 tw=80:

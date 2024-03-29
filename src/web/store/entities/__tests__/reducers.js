/* Copyright (C) 2018-2022 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
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
      alert: initState,
      audit: initState,
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
      override: initState,
      permission: initState,
      policy: initState,
      portlist: initState,
      reportconfig: initState,
      reportformat: initState,
      report: initState,
      result: initState,
      role: initState,
      scanconfig: initState,
      scanner: initState,
      schedule: initState,
      tag: initState,
      target: initState,
      task: initState,
      ticket: initState,
      tlscertificate: initState,
      user: initState,
      vuln: initState,
    });
  });
});

// vim: set ts=2 sw=2 tw=80:

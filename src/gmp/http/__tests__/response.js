/* Copyright (C) 2019-2021 Greenbone Networks GmbH
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
import Response from '../response';

describe('Response tests', () => {
  test('should allow to get plain data', () => {
    const xhr = {
      response: 'foo',
      responseText: 'bar',
      responseXML: 'ipsum',
    };
    const response = new Response(xhr, {});

    expect(response.plainData()).toEqual('foo');
    expect(response.plainData('text')).toEqual('bar');
    expect(response.plainData('xml')).toEqual('ipsum');
  });
});

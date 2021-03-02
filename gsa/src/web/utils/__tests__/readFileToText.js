/* Copyright (C) 2020-2021 Greenbone Networks GmbH
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

import readFileToText from '../readFileToText';

describe('readFileToText tests', () => {
  test('Should read dummy file', async () => {
    const blob = new Blob(['Hello world!'], {type: 'text/plain'});
    const file = new Response(blob);

    expect(await readFileToText(file)).toEqual('Hello world!');
  });
  test('Should not crash on undefined', async () => {
    expect(await readFileToText()).toBeUndefined();
  });
});

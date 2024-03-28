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

import {initLocale} from 'gmp/locale/lang';

// Avoid "Error: Not implemented: navigation (except hash changes)"
// It is caused by clicking on <a> elements in tests
// https://stackoverflow.com/a/68038982/11044073
HTMLAnchorElement.prototype.click = jest.fn();

class FakeBackend {
  read(language, namespace, callback) {
    if (language.startsWith('en') || language.startsWith('de')) {
      // change language by calling the callback function
      return callback();
    }
    // change language and pass error message
    return callback('Unknown lang');
  }
}

FakeBackend.type = 'backend';

initLocale({
  backend: FakeBackend,
});

// vim: set ts=2 sw=2 tw=80:

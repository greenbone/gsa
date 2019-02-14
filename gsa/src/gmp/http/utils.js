/* Copyright (C) 2016-2019 Greenbone Networks GmbH
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
import 'core-js/fn/object/entries';
import 'core-js/fn/string/ends-with';
import 'core-js/fn/string/starts-with';

import {isDefined} from '../utils/identity';

export const buildUrlParams = params => {
  let argcount = 0;
  let uri = '';

  for (const [key, value] of Object.entries(params)) {
    if (isDefined(value)) {
      if (argcount++) {
        uri += '&';
      }
      uri += encodeURIComponent(key) + '=' + encodeURIComponent(value);
    }
  }
  return uri;
};

export const buildServerUrl = (server, path = '', protocol) => {
  if (isDefined(protocol)) {
    if (!protocol.endsWith(':')) {
      protocol += ':';
    }
  } else {
    protocol = window.location.protocol;
  }
  return protocol + '//' + server + '/' + path;
};

// vim: set ts=2 sw=2 tw=80:

/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2016 Greenbone Networks GmbH
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

import Model from '../model.js';

import {parse_int} from '../../utils.js';

export class Login extends Model {

  parseProperties(elem) {
    return {
      autorefresh: parse_int(elem.autorefresh._interval),
      client_address: elem.client_address,
      guest: elem.guest,
      i18n: elem.i18n,
      role: elem.role,
      severity: elem.severity,
      timezone: elem.timezone,
      token: elem.token,
      vendor_version: elem.vendor_version,
      version: elem.version,
    };
  }
}

export default Login;

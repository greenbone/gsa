/* Copyright (C) 2017-2020 Greenbone Networks GmbH
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
import Model from '../model';

import {isDefined} from '../utils/identity';

import {parseDate} from '../parser';

class Agent extends Model {
  static entityType = 'agent';

  static parseElement(element) {
    const ret = super.parseElement(element);

    if (isDefined(element.installer) && isDefined(element.installer.trust)) {
      ret.trust = {
        time: parseDate(element.installer.trust.time),
        status: element.installer.trust.__text,
      };

      delete ret.installer;
    }
    return ret;
  }
}

export default Agent;

// vim: set ts=2 sw=2 tw=80:

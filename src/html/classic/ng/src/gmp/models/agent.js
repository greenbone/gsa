/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2017 Greenbone Networks GmbH
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

import moment from 'moment';

import Model from '../model.js';

import {is_defined} from '../utils.js';

class Agent extends Model {

  static entity_type = 'agent';

  parseProperties(elem) {
    let ret = super.parseProperties(elem);

    if (is_defined(elem.installer) && is_defined(elem.installer.trust)) {
      ret.trust = {
        time: moment(elem.installer.trust.time),
        status: elem.installer.trust.__text,
      };

      delete ret.installer;
    }
    return ret;
  }
}

export default Agent;

// vim: set ts=2 sw=2 tw=80:

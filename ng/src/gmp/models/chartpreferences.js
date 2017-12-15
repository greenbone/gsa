/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2016 - 2017 Greenbone Networks GmbH
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

import {is_defined, for_each} from '../utils.js';
import logger from '../log.js';

const log = logger.getLogger('gmp.models.chartpreferences');

class ChartPreferences {

  constructor(element) {
    this.updateFromElement(element);

    if (!is_defined(this._preferences)) {
      this._preferences = {};
    }
  }

  get(id) {
    return this._preferences[id];
  }

  parseProroperties(elem) {
    const preferences = {};

    for_each(elem, pref => {
      let value;
      try {
        value = JSON.parse(pref.value);
      }
      catch (e) {
        log.warn('Could not parse chart preference value', pref.value);
        value = pref.value;
      }
      preferences[pref._id] = value;
    });

    return preferences;
  }

  updateFromElement(elem) {
    this._preferences = this.parseProroperties(elem);
  }
}

export default ChartPreferences;

// vim: set ts=2 sw=2 tw=80:

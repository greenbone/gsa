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

import {is_defined, is_empty, map} from '../../utils.js';

import Model from '../model.js';

class Param {

  constructor({name, type, value, options, ...other}) {
    this.default = other.default;
    this.name = name;
    this.value = value;
    this.max = type.max;
    this.min = type.min;
    this.type = type.__text;
    this.options = map(options, opt => opt); //FIXME
  }
}

export class ReportFormat extends Model {

  parseProperties(elem) {
    let ret = super.parseProperties(elem);

    if (is_defined(ret.trust)) {
      ret.trust = {
        value: ret.trust.__text,
        time: is_empty(ret.trust.time) ? undefined : moment(ret.trust.time),
      };
    }
    else {
      ret.trust = {
      };
    }

    ret.params = map(ret.param, param => {
      return new Param(param);
    });

    delete ret.param;

    return ret;
  }

  isActive() {
    return this.active === '1';
  }
}

export default ReportFormat;

// vim: set ts=2 sw=2 tw=80:

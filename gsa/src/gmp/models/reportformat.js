/* Copyright (C) 2017-2019 Greenbone Networks GmbH
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
import {isDefined, isObject} from '../utils/identity';
import {map} from '../utils/array';
import {isEmpty} from '../utils/string';

import {parseDate, parseYesNo, YES_VALUE} from '../parser';

import Model, {parseModelFromElement} from '../model';

const get_value = val => {
  return isObject(val) ? val.__text : val;
};

class Param {
  constructor({name, type, value, ...other}) {
    this.default = get_value(other.default);
    this.name = name;
    this.max = type.max;
    this.min = type.min;
    this.type = get_value(type);

    if (isObject(type.options)) {
      this.options = map(type.options.option, opt => {
        return {
          value: opt,
          name: opt,
        };
      });
    } else {
      this.options = [];
    }

    if (this.type === 'report_format_list') {
      this.value = map(value.report_format, format => format._id);
    } else {
      this.value = get_value(value);
    }
  }
}

class ReportFormat extends Model {
  static entityType = 'reportformat';

  static parseElement(element) {
    const ret = super.parseElement(element);

    if (isDefined(ret.trust)) {
      ret.trust = {
        value: ret.trust.__text,
        time: isEmpty(ret.trust.time) ? undefined : parseDate(ret.trust.time),
      };
    } else {
      ret.trust = {};
    }

    ret.params = map(ret.param, param => {
      return new Param(param);
    });

    delete ret.param;

    if (isDefined(ret.alerts)) {
      ret.alerts = map(ret.alerts.alert, alert =>
        parseModelFromElement(alert, 'alert'),
      );
    } else {
      ret.alerts = [];
    }

    ret.active = parseYesNo(element.active);

    ret.predefined = parseYesNo(element.predefined);

    return ret;
  }

  isPredefined() {
    return this.predefined === YES_VALUE;
  }

  isActive() {
    return this.active === YES_VALUE;
  }

  isTrusted() {
    return this.trust.value === 'yes';
  }
}

export default ReportFormat;

// vim: set ts=2 sw=2 tw=80:

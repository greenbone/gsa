/* Copyright (C) 2017-2021 Greenbone Networks GmbH
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
import {hasValue, isDefined, isObject} from 'gmp/utils/identity';
import {map} from 'gmp/utils/array';
import {isEmpty} from 'gmp/utils/string';

import {parseDate, parseYesNo, YES_VALUE, parseBoolean} from 'gmp/parser';

import Model, {parseModelFromElement} from 'gmp/model';

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

  static parseObject(object) {
    const ret = super.parseObject(object);

    if (hasValue(ret.trust)) {
      ret.trust = {
        value: ret.trust,
        time: isEmpty(object.trustTime)
          ? undefined
          : parseDate(object.trustTime),
      };
    } else {
      ret.trust = {};
    }

    // object has no params
    // Has no alert field
    // active and predefined are already boolean

    return ret;
  }

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
    ret.predefined = parseBoolean(element.predefined);

    return ret;
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

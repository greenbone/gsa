/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2017 - 2018 Greenbone Networks GmbH
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
import {is_defined, is_model_element} from '../utils/identity';
import {map} from '../utils/array';
import {is_empty} from '../utils/string';

import List from '../list.js';
import Model from '../model.js';
import {
  parse_csv,
  parse_severity,
  parse_text,
  parse_yesno,
  parseDate,
  YES_VALUE,
} from '../parser.js';

import Nvt from './nvt.js';

export const MANUAL = '1';
export const ANY = '0';

export const ACTIVE_NO_VALUE = '0';
export const ACTIVE_YES_FOR_NEXT_VALUE = '1';
export const ACTIVE_YES_ALWAYS_VALUE = '-1';
export const ACTIVE_YES_UNTIL_VALUE = '-2';

export const DEFAULT_DAYS = 30;
export const DEFAULT_OID_VALUE = '1.3.6.1.4.1.25623.1.0.';

export const TASK_ANY = '';
export const TASK_SELECTED = '0';

export const RESULT_ANY = '';
export const RESULT_UUID = '0';

export const SEVERITY_FALSE_POSITIVE = -1;

class Override extends Model {

  static entity_type = 'override';

  parseProperties(elem) {
    let ret = super.parseProperties(elem);

    if (ret.nvt) {
      ret.nvt = new Nvt(ret.nvt);
      ret.name = ret.nvt.name;
    }

    ret.severity = parse_severity(ret.severity);

    ret.new_severity = parse_severity(ret.new_severity);

    ret = {...ret, ...parse_text(ret.text)};

    if (is_model_element(ret.task)) {
      ret.task = new Model(ret.task, 'task');
    }
    else {
      delete ret.task;
    }

    if (is_model_element(ret.result)) {
      ret.result = new Model(ret.result, 'result');
    }
    else {
      delete ret.result;
    }

    ret.active = parse_yesno(elem.active);
    ret.text_excerpt = parse_yesno(elem.text_excerpt);

    ret.hosts = parse_csv(ret.hosts);

    if (is_empty(elem.port)) {
      delete ret.port;
    }

    if (is_defined(elem.end_time) && elem.end_time.length > 0) {
      ret.end_time = parseDate(elem.end_time);
    }
    else {
      delete ret.end_time;
    }

    return ret;
  }

  isActive() {
    return this.active === YES_VALUE;
  }

  isExcerpt() {
    return this.text_excerpt === YES_VALUE;
  }
}

export const parse_overrides = overrides => {
  let active = false;
  let entries = [];
  if (is_defined(overrides)) {
    entries = map(overrides.override, override => {
      const o = new Override(override);
      active = active || o.isActive();
      return o;
    });
  }
  const list = new List(entries);
  list.active = active;
  return list;
};

export default Override;

// vim: set ts=2 sw=2 tw=80:

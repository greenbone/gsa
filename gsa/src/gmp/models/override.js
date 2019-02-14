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
import {isModelElement} from '../utils/identity';
import {isEmpty} from '../utils/string';

import Model from '../model';
import {
  parseCsv,
  parseSeverity,
  parseTextElement,
  parseYesNo,
  YES_VALUE,
} from '../parser';

import Nvt from './nvt';

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
  static entityType = 'override';

  parseProperties(elem) {
    let ret = super.parseProperties(elem);

    if (ret.nvt) {
      ret.nvt = new Nvt(ret.nvt);
      ret.name = ret.nvt.name;
    }

    ret.severity = parseSeverity(ret.severity);

    ret.new_severity = parseSeverity(ret.new_severity);

    ret = {...ret, ...parseTextElement(ret.text)};

    if (isModelElement(ret.task)) {
      ret.task = new Model(ret.task, 'task');
    } else {
      delete ret.task;
    }

    if (isModelElement(ret.result)) {
      ret.result = new Model(ret.result, 'result');
    } else {
      delete ret.result;
    }

    ret.active = parseYesNo(elem.active);
    ret.text_excerpt = parseYesNo(elem.text_excerpt);

    ret.hosts = parseCsv(ret.hosts);

    if (isEmpty(elem.port)) {
      delete ret.port;
    }

    return ret;
  }

  isExcerpt() {
    return this.text_excerpt === YES_VALUE;
  }
}

export default Override;

// vim: set ts=2 sw=2 tw=80:

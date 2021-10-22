/* Copyright (C) 2017-2020 Greenbone Networks GmbH
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
import {isModelElement} from '../utils/identity';
import {isEmpty} from '../utils/string';

import Model, {parseModelFromElement} from '../model';
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
export const DEFAULT_OID_VALUE = '1.3.6.1.4.1.25623.1.';

export const TASK_ANY = '';
export const TASK_SELECTED = '0';

export const RESULT_ANY = '';
export const RESULT_UUID = '0';

export const SEVERITY_FALSE_POSITIVE = -1;

class Override extends Model {
  static entityType = 'override';

  static parseElement(element) {
    let ret = super.parseElement(element);

    if (ret.nvt) {
      ret.nvt = Nvt.fromElement(ret.nvt);
      ret.name = ret.nvt.name;
    }

    ret.severity = parseSeverity(ret.severity);

    ret.newSeverity = parseSeverity(ret.new_severity);

    delete ret.new_severity;

    ret = {...ret, ...parseTextElement(ret.text)};

    if (isModelElement(ret.task)) {
      ret.task = parseModelFromElement(ret.task, 'task');
    } else {
      delete ret.task;
    }

    if (isModelElement(ret.result)) {
      ret.result = parseModelFromElement(ret.result, 'result');
    } else {
      delete ret.result;
    }

    ret.active = parseYesNo(element.active);
    ret.textExcerpt = parseYesNo(element.text_excerpt);

    ret.hosts = parseCsv(ret.hosts);

    if (isEmpty(element.port)) {
      delete ret.port;
    }

    return ret;
  }

  isExcerpt() {
    return this.textExcerpt === YES_VALUE;
  }
}

export default Override;

// vim: set ts=2 sw=2 tw=80:

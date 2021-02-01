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
import {isModelElement} from 'gmp/utils/identity';
import {isEmpty} from 'gmp/utils/string';

import Model, {parseModelFromElement} from 'gmp/model';
import {
  parseCsv,
  parseSeverity,
  parseTextElement,
  parseYesNo,
} from 'gmp/parser';

import Nvt from './nvt';

export const NOTE_ACTIVE_UNLIMITED_VALUE = -2;
export const NOTE_INACTIVE_VALUE = -1;

class Note extends Model {
  static entityType = 'note';

  static parseElement(element) {
    let ret = super.parseElement(element);

    if (ret.nvt) {
      ret.nvt = Nvt.fromElement(ret.nvt);
      ret.name = ret.nvt.name;
    }

    ret = {...ret, text: parseTextElement(ret.text)};

    ret.severity = parseSeverity(ret.severity);

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

    ret.hosts = parseCsv(element.hosts);

    if (isEmpty(element.port)) {
      delete ret.port;
    }

    return ret;
  }
}

export default Note;

// vim: set ts=2 sw=2 tw=80:

/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Model, {parseModelFromElement} from 'gmp/model';
import {
  parseCsv,
  parseSeverity,
  parseTextElement,
  parseYesNo,
  YES_VALUE,
} from 'gmp/parser';
import {isModelElement} from 'gmp/utils/identity';
import {isEmpty} from 'gmp/utils/string';

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

    ret = {...ret, ...parseTextElement(ret.text)};

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
    ret.textExcerpt = parseYesNo(element.text_excerpt);

    ret.hosts = parseCsv(element.hosts);

    if (isEmpty(element.port)) {
      delete ret.port;
    }

    return ret;
  }

  isExcerpt() {
    return this.textExcerpt === YES_VALUE;
  }
}

export default Note;

/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 * Steffen Waterkamp <steffen.waterkamp@greenbone.net>
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
import {is_defined, isModelElement} from '../utils/identity';
import {map} from '../utils/array';
import {isEmpty} from '../utils/string';

import List from '../list.js';
import Model from '../model.js';
import {
  parseCsv,
  parseSeverity,
  parseText,
  parseYesNo,
  YES_VALUE,
} from '../parser.js';

import Nvt from './nvt.js';

export const NOTE_ACTIVE_UNLIMITED_VALUE = '-2';
export const NOTE_INACTIVE_VALUE = '-1';

class Note extends Model {

  static entity_type = 'note';

  parseProperties(elem) {
    let ret = super.parseProperties(elem);

    if (ret.nvt) {
      ret.nvt = new Nvt(ret.nvt);
      ret.name = ret.nvt.name;
    }

    ret = {...ret, ...parseText(ret.text)};

    ret.severity = parseSeverity(ret.severity);

    if (isModelElement(ret.task)) {
      ret.task = new Model(ret.task, 'task');
    }
    else {
      delete ret.task;
    }

    if (isModelElement(ret.result)) {
      ret.result = new Model(ret.result, 'result');
    }
    else {
      delete ret.result;
    }

    ret.active = parseYesNo(elem.active);
    ret.text_excerpt = parseYesNo(elem.text_excerpt);

    ret.hosts = parseCsv(elem.hosts);

    if (isEmpty(elem.port)) {
      delete ret.port;
    }

    return ret;
  }

  isExcerpt() {
    return this.text_excerpt === YES_VALUE;
  }
}

export const parse_notes = notes => {
  let active = false;
  let entries = [];
  if (is_defined(notes)) {
    entries = map(notes.note, note => {
      const n = new Note(note);
      active = active || n.isActive();
      return n;
    });
  }
  const list = new List(entries);
  list.active = active;
  return list;
};

export default Note;

// vim: set ts=2 sw=2 tw=80:

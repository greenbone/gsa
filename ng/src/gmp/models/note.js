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
import moment from 'moment';

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
  YES_VALUE,
} from '../parser.js';

import Nvt from './nvt.js';

class Note extends Model {

  static entity_type = 'note';

  parseProperties(elem) {
    let ret = super.parseProperties(elem);

    if (ret.nvt) {
      ret.nvt = new Nvt(ret.nvt);
      ret.name = ret.nvt.name;
    }

    ret = {...ret, ...parse_text(ret.text)};

    ret.severity = parse_severity(ret.severity);

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

    ret.hosts = parse_csv(elem.hosts);

    if (is_empty(elem.port)) {
      delete ret.port;
    }

    if (is_defined(elem.end_time) && elem.end_time.length > 0) {
      ret.end_time = moment(elem.end_time);
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

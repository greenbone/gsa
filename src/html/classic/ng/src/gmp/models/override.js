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

import {extend, is_defined} from '../../utils.js';

import Model from '../model.js';

import Nvt from './nvt.js';
import {parse_severity, parse_text} from './parser.js';

export class Override extends Model {

  parseProperties(elem) {
    let ret = super.parseProperties(elem);

    if (ret.nvt) {
      ret.nvt = new Nvt(ret.nvt);
    }

    ret.severity = parse_severity(ret.severity);

    ret.new_severity = parse_severity(ret.new_severity);

    ret = extend(ret, parse_text(ret.text));

    if (is_defined(ret.task)) {
      ret.task = new Model(ret.task);
    }
    if (is_defined(ret.result)) {
      ret.result = new Model(ret.result);
    }
    return ret;
  }

  isActive() {
    return this.active === '1';
  }

  isOrphan() {
    return this.orphan === '1';
  }

  isExcerpt() {
    return this.text_excerpt === '1';
  }
}

export default Override;

// vim: set ts=2 sw=2 tw=80:

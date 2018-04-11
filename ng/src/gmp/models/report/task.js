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
import {is_defined} from '../../utils/identity';
import {is_empty} from '../../utils/string';

import {parse_progress} from '../../parser.js';

import Model from '../../model.js';

/*
 * Use own task model for reports to avoid cyclic dependencies
 */

class ReportTask extends Model {

  static entity_type = 'task';

  parseProperties(elem) {
    const copy = super.parseProperties(elem);

    const {target} = elem;
    if (is_defined(target) && !is_empty(target._id)) {
      copy.target = new Model(target, 'target');
    }
    else {
      delete copy.target;
    }

    copy.progress = parse_progress(elem.progress);

    return copy;
  }

  isContainer() {
    return !is_defined(this.target);
  }
}

export default ReportTask;

// vim: set ts=2 sw=2 tw=80:

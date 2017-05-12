/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2016 - 2017 Greenbone Networks GmbH
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

import {extend, is_string, map, shallow_copy} from '../../utils.js';

import Model from '../model.js';

const parse_tags = tags => {
  let newtags = {};

  if (tags) {
    let splited = tags.split('|');
    for (let t of splited) {
      let [key, value] = t.split('=');
      newtags[key] = value;
    }
  }

  return newtags;
};

const parse_cve_ids = cve_ids => {
  if (is_string(cve_ids) && cve_ids !== 'NOCVE') {
    return cve_ids.split(',').map(id => id.trim());
  }
  return [];
};

export class Nvt extends Model {

  parseProperties(elem) {
    let ret = super.parseProperties(elem);

    if (elem.nvt) { // we have an info element
      extend(ret, elem.nvt);
      delete ret.nvt;
    }

    ret.oid = ret._oid;
    ret.tags = parse_tags(ret.tags);
    ret.cve_ids = parse_cve_ids(ret.cve_id);
    ret.severity = ret.cvss_base;
    delete ret.cvss_base;

    ret.preferences = map(elem.preferences.preference, preference => {
      let pref = shallow_copy(preference);
      delete pref.nvt;
      return pref;
    });

    return ret;
  }
}

export default Nvt;

// vim: set ts=2 sw=2 tw=80:

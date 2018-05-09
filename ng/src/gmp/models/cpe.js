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

import {is_defined} from '../utils/identity';
import {is_empty} from '../utils/string';
import {map} from '../utils/array';

import Info from './info.js';

import {parse_severity} from '../parser.js';

class Cpe extends Info {

  static info_type = 'cpe';

  parseProperties(elem) {
    const ret = super.parseProperties(elem, 'cpe');

    ret.severity = parse_severity(ret.max_cvss);
    delete ret.max_cvss;

    if (is_defined(ret.cves) && is_defined(ret.cves.cve)) {
      ret.cves = map(ret.cves.cve.entry, cve => ({
        id: cve._id,
        severity: parse_severity(cve.cvss.base_metrics.score.__text),
      }));
    }
    else {
      ret.cves = [];
    }

    if (is_empty(ret.status)) {
      delete ret.status;
    }

    return ret;
  }
}

export default Cpe;

// vim: set ts=2 sw=2 tw=80:

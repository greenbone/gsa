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

import {isDefined} from 'gmp/utils/identity';
import {isEmpty} from 'gmp/utils/string';
import {map} from 'gmp/utils/array';

import Info from './info';

import {parseSeverity, parseDate} from 'gmp/parser';

class Cpe extends Info {
  static entityType = 'cpe';

  static parseElement(element) {
    const ret = super.parseElement(element, 'cpe');

    ret.severity = parseSeverity(element.max_cvss);
    delete ret.max_cvss;

    if (isDefined(element.cves) && isDefined(element.cves.cve)) {
      ret.cves = map(ret.cves.cve.entry, cve => ({
        id: cve._id,
        severity: parseSeverity(cve.cvss.base_metrics.score.__text),
      }));
    } else {
      ret.cves = [];
    }

    if (isEmpty(element.status)) {
      delete ret.status;
    }

    if (isDefined(element.update_time)) {
      ret.updateTime = parseDate(ret.update_time);
      delete ret.update_time;
    }

    return ret;
  }
}

export default Cpe;

// vim: set ts=2 sw=2 tw=80:

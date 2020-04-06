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

import {isDefined} from 'gmp/utils/identity';
import {isEmpty} from 'gmp/utils/string';
import {map} from 'gmp/utils/array';

import Info from './info';

import {parseSeverity, parseDate} from 'gmp/parser';

class Cpe extends Info {
  static entityType = 'cpe';

  static parseElement(element) {
    const ret = super.parseElement(element, 'cpe');

    ret.severity = parseSeverity(ret.max_cvss);
    delete ret.max_cvss;

    if (isDefined(ret.cves) && isDefined(ret.cves.cve)) {
      ret.cves = map(ret.cves.cve.entry, cve => ({
        id: cve._id,
        severity: parseSeverity(cve.cvss.base_metrics.score.__text),
      }));
    } else {
      ret.cves = [];
    }

    if (isEmpty(ret.status)) {
      delete ret.status;
    }

    if (isDefined(ret.update_time)) {
      ret.updateTime = parseDate(ret.update_time);
      delete ret.update_time;
    }

    return ret;
  }
}

export default Cpe;

// vim: set ts=2 sw=2 tw=80:

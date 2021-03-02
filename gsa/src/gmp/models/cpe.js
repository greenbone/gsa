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

import {isDefined} from 'gmp/utils/identity';
import {isEmpty} from 'gmp/utils/string';
import {map} from 'gmp/utils/array';

import Info from './info';

import {parseScoreToSeverity, parseSeverity, parseDate} from 'gmp/parser';

class Cpe extends Info {
  static entityType = 'cpe';

  static parseObject(object) {
    const ret = super.parseObject(object);

    ret.severity = parseScoreToSeverity(ret.score);
    delete ret.score;

    return ret;
  }

  static parseElement(element) {
    const ret = super.parseElement(element, 'cpe');

    ret.severity = parseScoreToSeverity(ret.score);
    delete ret.score;

    ret.cveRefCount = ret.cve_refs;
    delete ret.cve_refs;

    if (isDefined(ret.nvd_id)) {
      ret.nvdId = ret.nvd_id;
      delete ret.nvd_id;
    }

    if (isDefined(ret.cves) && isDefined(ret.cves.cve)) {
      ret.cveRefs = map(ret.cves.cve, cve => ({
        id: cve.entry._id,
        severity: parseSeverity(cve.entry.cvss.base_metrics.score),
      }));
    } else {
      ret.cveRefs = [];
    }

    if (isEmpty(ret.status)) {
      delete ret.status;
    }

    if (isDefined(ret.nvd_id)) {
      ret.nvdId = ret.nvd_id;
    }

    if (isDefined(ret.update_time)) {
      ret.updateTime = parseDate(ret.update_time);
      delete ret.update_time;
    }

    if (isDefined(ret.raw_data) && isDefined(ret.raw_data['cpe-item'])) {
      const cpeItem = ret.raw_data['cpe-item'];
      if (isDefined(cpeItem._deprecated_by)) {
        ret.deprecatedBy = cpeItem._deprecated_by;
      }
    }
    return ret;
  }
}

export default Cpe;

// vim: set ts=2 sw=2 tw=80:

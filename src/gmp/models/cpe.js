/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
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
    ret.severity = parseSeverity(ret.severity);

    if (isDefined(ret.cves) && isDefined(ret.cves.cve)) {
      ret.cves = map(ret.cves.cve, cve => ({
        id: cve.entry._id,
        severity: parseSeverity(cve.entry.cvss.base_metrics.score),
      }));
    } else {
      ret.cves = [];
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

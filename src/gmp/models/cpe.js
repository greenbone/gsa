/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Info from 'gmp/models/info';
import {parseSeverity, parseDate, parseBoolean} from 'gmp/parser';
import {map} from 'gmp/utils/array';
import {isDefined} from 'gmp/utils/identity';
import {isEmpty} from 'gmp/utils/string';

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
      // old ID from nvd just kept for backwards compatibility and should be removed in future
      ret.cpeNameId = ret.nvd_id;
      delete ret.nvd_id;
    }

    if (isDefined(ret.cpe_name_id)) {
      ret.cpeNameId = ret.cpe_name_id;
      delete ret.cpe_name_id;
    }

    if (isDefined(ret.update_time)) {
      ret.updateTime = parseDate(ret.update_time);
      delete ret.update_time;
    }

    /*
     * This code includes a backup check for deprecated field `raw_data`.
     * Once `raw_data` is removed from the API, this backup check can be removed.
     */

    if (isDefined(ret.deprecated)) {
      ret.deprecated = parseBoolean(ret.deprecated);
    } else {
      ret.deprecated = false;
    }

    if (ret.deprecated === true && isDefined(ret.deprecated_by)) {
      ret.deprecatedBy = ret.deprecated_by._cpe_id;
      delete ret.deprecated_by;
    } else if (isDefined(ret.raw_data?.['cpe-item']?._deprecated_by)) {
      ret.deprecatedBy = ret.raw_data['cpe-item']._deprecated_by;
    }

    return ret;
  }
}

export default Cpe;

/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Asset from 'gmp/models/asset';
import {parseSeverity} from 'gmp/parser';


class OperatingSystem extends Asset {
  static entityType = 'operatingsystem';

  static parseElement(element) {
    const ret = super.parseElement(element);

    if (ret.os) {
      ret.averageSeverity = ret.os.average_severity
        ? parseSeverity(ret.os.average_severity.value)
        : undefined;
      delete ret.os.average_severity;
      ret.latestSeverity = ret.os.latest_severity
        ? parseSeverity(ret.os.latest_severity.value)
        : undefined;
      delete ret.os.latest_severity;
      ret.highestSeverity = ret.os.highest_severity
        ? parseSeverity(ret.os.highest_severity.value)
        : undefined;
      delete ret.os.highest_severity;

      ret.title = ret.os.title;
      ret.hosts = {
        length: ret.os.installs,
      };
      ret.allHosts = {
        length: ret.os.all_installs,
      };
    }

    delete ret.os;

    return ret;
  }
}

export default OperatingSystem;

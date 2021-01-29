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
import Asset from './asset';
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
    }

    delete ret.os;

    return ret;
  }
}

export default OperatingSystem;

// vim: set ts=2 sw=2 tw=80:

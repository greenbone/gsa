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
import Asset from './asset';
import {parseSeverity} from '../parser';

class OperatingSystem extends Asset {
  static entityType = 'operatingsystem';

  parseProperties(elem) {
    const ret = super.parseProperties(elem);

    if (ret.os) {
      ret.average_severity = ret.os.average_severity
        ? parseSeverity(ret.os.average_severity.value)
        : undefined;
      ret.latest_severity = ret.os.latest_severity
        ? parseSeverity(ret.os.latest_severity.value)
        : undefined;
      ret.highest_severity = ret.os.highest_severity
        ? parseSeverity(ret.os.highest_severity.value)
        : undefined;

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

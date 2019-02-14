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
import {isDefined} from '../utils/identity';
import {forEach, map} from '../utils/array';

import {parseSeverity} from '../parser';

import Info from './info';

class DfnCertAdv extends Info {
  static entityType = 'dfncert';

  parseProperties(elem) {
    const ret = super.parseProperties(elem, 'dfn_cert_adv');

    ret.severity = parseSeverity(ret.max_cvss);
    delete ret.max_cvss;

    const {raw_data} = ret;

    ret.additional_links = [];
    ret.cves = [];

    if (isDefined(raw_data) && isDefined(raw_data.entry)) {
      const {entry} = raw_data;

      if (isDefined(entry.link)) {
        forEach(entry.link, link => {
          if (link._rel === 'alternate') {
            ret.advisory_link = link._href;
          } else {
            ret.additional_links.push(link._href);
          }
        });
      }

      if (isDefined(entry.summary)) {
        ret.summary = entry.summary.__text;
      }

      if (isDefined(entry.cve)) {
        ret.cves = map(entry.cve, cve => cve.__text);
      }
    }

    return ret;
  }
}

export default DfnCertAdv;

// vim: set ts=2 sw=2 tw=80:

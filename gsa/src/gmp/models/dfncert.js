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
import {forEach, map} from 'gmp/utils/array';

import {parseSeverity} from 'gmp/parser';

import Info from './info';

class DfnCertAdv extends Info {
  static entityType = 'dfncert';

  static parseElement(element) {
    const ret = super.parseElement(element, 'dfn_cert_adv');

    ret.severity = parseSeverity(ret.score / 10);
    delete ret.score;

    const {raw_data} = ret;

    ret.additionalLinks = [];
    ret.cves = [];

    if (isDefined(raw_data) && isDefined(raw_data.entry)) {
      const {entry} = raw_data;

      if (isDefined(entry.link)) {
        forEach(entry.link, link => {
          if (link._rel === 'alternate') {
            ret.advisoryLink = link._href;
          } else {
            ret.additionalLinks.push(link._href);
          }
        });
      }

      if (isDefined(entry.summary)) {
        ret.summary = entry.summary.__text;
      }

      if (isDefined(entry.cve)) {
        ret.cves = map(entry.cve, cve => cve);
      }
    }

    return ret;
  }
}

export default DfnCertAdv;

// vim: set ts=2 sw=2 tw=80:

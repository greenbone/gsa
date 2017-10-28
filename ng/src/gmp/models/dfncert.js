/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2017 Greenbone Networks GmbH
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
import {is_defined, for_each, map} from '../utils.js';

import {parse_severity} from '../parser.js';

import Info from './info.js';

class DfnCertAdv extends Info {

  static info_type = 'dfn_cert_adv';

  parseProperties(elem) {
    const ret = super.parseProperties(elem, 'dfn_cert_adv');

    ret.severity = parse_severity(ret.max_cvss);
    delete ret.max_cvss;

    const {raw_data} = ret;

    ret.additional_links = [];
    ret.cves = [];

    if (is_defined(raw_data) && is_defined(raw_data.entry)) {
      const {entry} = raw_data;

      if (is_defined(entry.link)) {
        for_each(entry.link, link => {
          if (link._rel === 'alternate') {
            ret.advisory_link = link._href;
          }
          else {
            ret.additional_links.push(link._href);
          }
        });
      }

      if (is_defined(entry.summary)) {
        ret.summary = entry.summary.__text;
      }

      if (is_defined(entry.cve)) {
        ret.cves = map(entry.cve, cve => cve.__text);
      }
    }

    return ret;
  }
}

export default DfnCertAdv;

// vim: set ts=2 sw=2 tw=80:

/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2017 - 2018 Greenbone Networks GmbH
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
import moment from 'moment';

import {is_defined} from '../utils/identity';
import {for_each, map} from '../utils/array';

import {parse_severity} from '../parser.js';

import Info from './info.js';

class CertBundAdv extends Info {

  static info_type = 'cert_bund_adv';

  parseProperties(elem) {
    const ret = super.parseProperties(elem, 'cert_bund_adv');

    ret.severity = parse_severity(ret.max_cvss);
    delete ret.max_cvss;

    ret.categories = [];
    ret.description = [];
    ret.cves = [];
    ret.additional_information = [];

    if (is_defined(ret.raw_data) && is_defined(ret.raw_data.Advisory)) {
      const {raw_data} = ret;
      const {Advisory: advisory} = raw_data;

      ret.version = advisory.Version;
      ret.software = advisory.Software;
      ret.platform = advisory.Platform;
      ret.effect = advisory.effect;
      ret.remote_attack = advisory.RemoteAttack;
      ret.risk = advisory.Risk;
      ret.reference_source = advisory.Reference_Source;
      ret.reference_url = advisory.Reference_URL;
      ret.categories = advisory.CategoryTree;

      if (!is_defined(ret.version) && is_defined(advisory.Ref_Num)) {
        ret.version = advisory.Ref_Num._update;
      }

      if (is_defined(advisory.Description) &&
        is_defined(advisory.Description.Element)) {
        for_each(advisory.Description.Element, element => {
          if (is_defined(element.TextBlock)) {
            ret.description.push(element.TextBlock);
          }
          else if (is_defined(element.Infos)) {
            ret.additional_information = ret.additional_information.concat(
              map(element.Infos.Info, info => ({
                issuer: info._Info_Issuer,
                url: info._Info_URL,
              }))
            );
          }
        });
      }

      if (is_defined(advisory.RevisionHistory)) {
        ret.revision_history = map(advisory.RevisionHistory.Revision, rev => ({
          revision: rev.Number,
          description: rev.Description,
          date: moment(rev.Date),
        }));
      }

      if (is_defined(advisory.CVEList && is_defined(advisory.CVEList.CVE))) {
        ret.cves = map(advisory.CVEList.CVE, cve => cve);
      }
    }

    return ret;
  }
}

export default CertBundAdv;

// vim: set ts=2 sw=2 tw=80:

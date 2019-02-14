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

import {parseSeverity, parseDate} from '../parser';

import Info from './info';

class CertBundAdv extends Info {
  static entityType = 'certbund';

  parseProperties(elem) {
    const ret = super.parseProperties(elem, 'cert_bund_adv');

    ret.severity = parseSeverity(ret.max_cvss);
    delete ret.max_cvss;

    ret.categories = [];
    ret.description = [];
    ret.cves = [];
    ret.additional_information = [];

    if (isDefined(ret.raw_data) && isDefined(ret.raw_data.Advisory)) {
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
      ret.categories = map(advisory.CategoryTree, categoryTree => categoryTree);

      if (!isDefined(ret.version) && isDefined(advisory.Ref_Num)) {
        ret.version = advisory.Ref_Num._update;
      }

      if (
        isDefined(advisory.Description) &&
        isDefined(advisory.Description.Element)
      ) {
        forEach(advisory.Description.Element, element => {
          if (isDefined(element.TextBlock)) {
            ret.description.push(element.TextBlock);
          } else if (isDefined(element.Infos)) {
            ret.additional_information = ret.additional_information.concat(
              map(element.Infos.Info, info => ({
                issuer: info._Info_Issuer,
                url: info._Info_URL,
              })),
            );
          }
        });
      }

      if (isDefined(advisory.RevisionHistory)) {
        ret.revision_history = map(advisory.RevisionHistory.Revision, rev => ({
          revision: rev.Number,
          description: rev.Description,
          date: parseDate(rev.Date),
        }));
      }

      if (isDefined(advisory.CVEList && isDefined(advisory.CVEList.CVE))) {
        ret.cves = map(advisory.CVEList.CVE, cve => cve);
      }
    }

    return ret;
  }
}

export default CertBundAdv;

// vim: set ts=2 sw=2 tw=80:

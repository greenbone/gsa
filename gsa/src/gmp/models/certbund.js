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

import {parseSeverity, parseDate} from 'gmp/parser';

import Info from './info';

class CertBundAdv extends Info {
  static entityType = 'certbund';

  static parseElement(element) {
    const ret = super.parseElement(element, 'cert_bund_adv');

    ret.severity = parseSeverity(ret.score / 10);
    delete ret.score;

    ret.categories = [];
    ret.description = [];
    ret.cves = [];
    ret.additionalInformation = [];

    if (isDefined(ret.raw_data) && isDefined(ret.raw_data.Advisory)) {
      const {raw_data} = ret;
      const {Advisory: advisory} = raw_data;

      ret.version = advisory.Version;
      ret.software = advisory.Software;
      ret.platform = advisory.Platform;
      ret.effect = advisory.effect;
      ret.remoteAttack = advisory.RemoteAttack;
      ret.risk = advisory.Risk;
      ret.referenceSource = advisory.Reference_Source;
      ret.referenceUrl = advisory.Reference_URL;
      ret.categories = map(advisory.CategoryTree, categoryTree => categoryTree);

      if (!isDefined(ret.version) && isDefined(advisory.Ref_Num)) {
        ret.version = advisory.Ref_Num._update;
      }

      if (
        isDefined(advisory.Description) &&
        isDefined(advisory.Description.Element)
      ) {
        forEach(advisory.Description.Element, desciptionElement => {
          if (isDefined(desciptionElement.TextBlock)) {
            ret.description.push(desciptionElement.TextBlock);
          } else if (isDefined(desciptionElement.Infos)) {
            ret.additionalInformation = ret.additionalInformation.concat(
              map(desciptionElement.Infos.Info, info => ({
                issuer: info._Info_Issuer,
                url: info._Info_URL,
              })),
            );
          }
        });
      }

      if (isDefined(advisory.RevisionHistory)) {
        ret.revisionHistory = map(advisory.RevisionHistory.Revision, rev => ({
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

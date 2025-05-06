/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Info from 'gmp/models/info';
import {parseSeverity, parseDate} from 'gmp/parser';
import {forEach, map} from 'gmp/utils/array';
import {isDefined} from 'gmp/utils/identity';

class CertBundAdv extends Info {
  static entityType = 'certbund';

  static parseElement(element) {
    const ret = super.parseElement(element, 'cert_bund_adv');

    ret.severity = parseSeverity(ret.severity);

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

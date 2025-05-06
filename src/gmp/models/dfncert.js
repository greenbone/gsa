/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Info from 'gmp/models/info';
import {parseSeverity} from 'gmp/parser';
import {forEach, map} from 'gmp/utils/array';
import {isDefined} from 'gmp/utils/identity';

class DfnCertAdv extends Info {
  static entityType = 'dfncert';

  static parseElement(element) {
    const ret = super.parseElement(element, 'dfn_cert_adv');
    ret.severity = parseSeverity(ret.severity);

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

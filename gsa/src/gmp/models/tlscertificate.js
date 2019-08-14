/* Copyright (C) 2019 Greenbone Networks GmbH
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
import Model from '../model';

import {forEach, unique} from 'gmp/utils/array';
import {isDefined} from 'gmp/utils/identity';

class TlsCertificate extends Model {
  static entityType = 'tlscertificate';

  parseProperties(elem) {
    const ret = super.parseProperties(elem);

    ret.issuerDn = elem.issuer_dn;
    delete ret.issuer_dn;

    ret.activationTime = elem.activation_time;
    delete ret.activation_time;

    ret.expirationTime = elem.expiration_time;
    delete ret.expiration_time;

    ret.lastCollected = elem.last_collected;
    delete ret.last_collected;

    const sourceReportIds = [];
    const sourceHostIps = [];
    const sourcePorts = [];

    if (isDefined(ret.sources)) {
      forEach(ret.sources.source, source => {
        if (isDefined(source.origin)) {
          if (source.origin.origin_type === 'Report') {
            sourceReportIds.push(source.origin.origin_id);
          }
        }
        if (isDefined(source.location)) {
          if (isDefined(source.location.host)) {
            sourceHostIps.push(source.location.host.ip);
          }
          if (isDefined(source.location.port)) {
            sourcePorts.push(source.location.port);
          }
        }
      });
    }

    ret.sourceReportIds = unique(sourceReportIds);
    ret.sourceHostIps = unique(sourceHostIps);
    ret.sourcePorts = unique(sourcePorts);

    delete ret.sources;

    return ret;
  }
}

export default TlsCertificate;

// vim: set ts=2 sw=2 tw=80:

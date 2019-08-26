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

import {_l} from 'gmp/locale/lang';

import Model from '../model';

import {parseBoolean, parseDate} from 'gmp/parser';
import {forEach} from 'gmp/utils/array';
import {isDefined} from 'gmp/utils/identity';

export const TIME_STATUS = {
  inactive: 'inactive',
  valid: 'valid',
  expired: 'expired',
  unknown: 'unknown',
};

export const TIME_STATUS_TRANSLATIONS = {
  [TIME_STATUS.expired]: _l('Expired'),
  [TIME_STATUS.inactive]: _l('Inactive'),
  [TIME_STATUS.unknown]: _l('Unknown'),
  [TIME_STATUS.valid]: _l('Valid'),
};

export const getTranslatableTimeStatus = status =>
  `${TIME_STATUS_TRANSLATIONS[status]}`;

class TlsCertificate extends Model {
  static entityType = 'tlscertificate';

  parseProperties(elem) {
    const ret = super.parseProperties(elem);

    ret.name = elem.issuer_dn;
    delete ret.issuer_dn;

    ret.activationTime = parseDate(elem.activation_time);
    delete ret.activation_time;

    ret.expirationTime = parseDate(elem.expiration_time);
    delete ret.expiration_time;

    ret.lastCollected = parseDate(elem.last_collected);
    delete ret.last_collected;

    ret.timeStatus = elem.time_status;
    delete ret.time_status;

    const sourceReportIds = new Set();
    const sourceHostIps = new Set();
    const sourcePorts = new Set();

    if (isDefined(ret.sources)) {
      forEach(ret.sources.source, source => {
        if (isDefined(source.origin)) {
          if (source.origin.origin_type === 'Report') {
            sourceReportIds.add(source.origin.origin_id);
          }
        }
        if (isDefined(source.location)) {
          if (isDefined(source.location.host)) {
            sourceHostIps.add(source.location.host.ip);
          }
          if (isDefined(source.location.port)) {
            sourcePorts.add(source.location.port);
          }
        }
      });
    }

    ret.sourceReportIds = [...sourceReportIds];
    ret.sourceHostIps = [...sourceHostIps];
    ret.sourcePorts = [...sourcePorts];

    delete ret.sources;

    ret.valid = parseBoolean(elem.valid);
    ret.trust = parseBoolean(elem.trust);

    ret.sha256Fingerprint = elem.sha256_fingerprint;
    delete ret.sha256_fingerprint;

    ret.md5Fingerprint = elem.md5_fingerprint;
    delete ret.md5_fingerprint;

    return ret;
  }
}

export default TlsCertificate;

// vim: set ts=2 sw=2 tw=80:

/* Copyright (C) 2019-2021 Greenbone Networks GmbH
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

import {_l} from 'gmp/locale/lang';

import Model from 'gmp/model';

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

  static parseElement(element) {
    const ret = super.parseElement(element);

    ret.certificate = isDefined(element.certificate)
      ? element.certificate.__text
      : undefined;

    ret.name = element.issuer_dn;
    delete ret.issuer_dn;

    ret.activationTime =
      element.activation_time === 'undefined' ||
      element.activation_time === 'unlimited'
        ? undefined
        : parseDate(element.activation_time);
    delete ret.activation_time;

    ret.expirationTime =
      element.expiration_time === 'undefined' ||
      element.expiration_time === 'unlimited'
        ? undefined
        : parseDate(element.expiration_time);
    delete ret.expiration_time;

    ret.lastSeen =
      element.last_seen === 'undefined' || element.last_seen === 'unlimited'
        ? undefined
        : parseDate(element.last_seen);
    delete ret.last_seen;

    ret.timeStatus = element.time_status;
    delete ret.time_status;

    const sourceReports = new Set();
    const sourceHosts = new Set();
    const sourcePorts = new Set();

    // in order for the Sets to work properly with unique object values
    // (Set uses object references, so for our purposes it contains duplicates)
    // we parse them into a string, put the string into the set (making it
    // unique) and in the end parse the strings back to objects with the correct
    // values and keys
    if (isDefined(ret.sources)) {
      forEach(ret.sources.source, source => {
        if (isDefined(source.origin)) {
          if (source.origin.origin_type === 'Report') {
            sourceReports.add(JSON.stringify(source.origin));
          }
        }
        if (isDefined(source.location)) {
          if (isDefined(source.location.host)) {
            sourceHosts.add(JSON.stringify(source.location.host));
          }
          if (isDefined(source.location.port)) {
            sourcePorts.add(source.location.port);
          }
        }
      });
    }

    ret.sourceReports = [...sourceReports].map(report => {
      const originObject = JSON.parse(report);
      return {
        id: originObject.origin_id,
        timestamp: originObject?.report?.date,
      };
    });
    ret.sourceHosts = [...sourceHosts].map(host => {
      const hostObject = JSON.parse(host);
      return {
        id: hostObject.asset._id,
        ip: hostObject.ip,
      };
    });
    ret.sourcePorts = [...sourcePorts];

    delete ret.sources;

    ret.valid = parseBoolean(element.valid);
    ret.trust = parseBoolean(element.trust);

    ret.sha256Fingerprint = element.sha256_fingerprint;
    delete ret.sha256_fingerprint;

    ret.md5Fingerprint = element.md5_fingerprint;
    delete ret.md5_fingerprint;

    return ret;
  }
}

export default TlsCertificate;

// vim: set ts=2 sw=2 tw=80:

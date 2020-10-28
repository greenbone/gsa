/* Copyright (C) 2017-2020 Greenbone Networks GmbH
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
import 'core-js/features/object/entries';

import {isArray, isDefined} from 'gmp/utils/identity';
import {isEmpty} from 'gmp/utils/string';
import {map} from 'gmp/utils/array';

import {
  parseSeverity,
  parseCvssV2BaseVector,
  parseDate,
  setProperties,
} from 'gmp/parser';

import Info from './info';

const delete_empty = (obj, props) => {
  for (const prop of props) {
    if (isEmpty(obj[prop])) {
      delete obj[prop];
    }
  }
};

const rename_props = (obj, rename = {}) => {
  for (const [oldname, newname] of Object.entries(rename)) {
    if (isDefined(obj[oldname])) {
      obj[newname] = obj[oldname];
      delete obj[oldname];
    }
  }
};

class Cve extends Info {
  static entityType = 'cve';

  static parseElement(element) {
    const ret = super.parseElement(element, 'cve');

    if (isDefined(ret.update_time)) {
      ret.updateTime = parseDate(ret.update_time);
      delete ret.update_time;
    }

    ret.severity = parseSeverity(ret.cvss);
    delete ret.cvss;

    if (isDefined(ret.nvts)) {
      ret.nvts = map(ret.nvts.nvt, nvt => {
        return setProperties({
          ...nvt,
          id: nvt._oid,
          oid: nvt._oid,
        });
      });
    }

    if (isDefined(ret.cert)) {
      ret.certs = map(ret.cert.cert_ref, ref => {
        return {
          name: ref.name,
          title: ref.title,
          cert_type: ref._type,
        };
      });

      delete ret.cert;
    } else {
      ret.certs = [];
    }

    delete_empty(ret, [
      'vector',
      'complexity',
      'authentication',
      'confidentiality_impact',
      'integrity_impact',
      'availability_impact',
      'cert',
    ]);

    ret.cvssBaseVector = parseCvssV2BaseVector({
      accessComplexity: ret.complexity,
      accessVector: ret.vector,
      authentication: ret.authentication,
      availabilityImpact: ret.availability_impact,
      confidentialityImpact: ret.confidentiality_impact,
      integrityImpact: ret.integrity_impact,
    });

    // use consistent names for cvss values
    rename_props(ret, {
      vector: 'cvssAccessVector',
      complexity: 'cvssAccessComplexity',
      authentication: 'cvssAuthentication',
      confidentiality_impact: 'cvssConfidentialityImpact',
      integrity_impact: 'cvssIntegrityImpact',
      availability_impact: 'cvssAvailabilityImpact',
    });

    if (isEmpty(ret.products)) {
      ret.products = [];
    } else {
      ret.products = ret.products.split(' ');
    }

    if (isDefined(ret.raw_data) && isDefined(ret.raw_data.entry)) {
      const {entry} = ret.raw_data;

      ret.publishedTime = parseDate(entry['published-datetime']);
      ret.lastModifiedTime = parseDate(entry['last-modified-datetime']);

      ret.references = map(entry.references, ref => ({
        name: ref.reference.__text,
        href: ref.reference._href,
        source: ref.source,
        reference_type: ref._reference_type,
      }));

      if (
        isDefined(entry.cvss) &&
        isDefined(entry.cvss.base_metrics) &&
        isDefined(entry.cvss.base_metrics.source)
      ) {
        ret.source = entry.cvss.base_metrics.source;
      }

      if (isDefined(entry.summary)) {
        // really don't know why entry.summary and ret.description can differ
        // but xslt did use the summary and and e.g. the description of
        // CVE-2017-2988 was empty but summary not
        ret.description = entry.summary;
      }

      const products = entry['vulnerable-software-list'];
      if (isDefined(products)) {
        ret.products = isArray(products.product)
          ? products.product
          : [products.product];
      }

      delete ret.raw_data;
    } else {
      ret.references = [];
    }

    return ret;
  }
}

export default Cve;

// vim: set ts=2 sw=2 tw=80:

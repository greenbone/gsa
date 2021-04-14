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

import {isArray, hasValue, isDefined} from 'gmp/utils/identity';
import {isEmpty} from 'gmp/utils/string';
import {map} from 'gmp/utils/array';

import {parseSeverity, parseDate, setProperties} from 'gmp/parser';

import {
  parseCvssV2BaseFromVector,
  parseCvssV3BaseFromVector,
} from 'gmp/parser/cvss';
import Info from './info';

class Cve extends Info {
  static entityType = 'cve';

  static parseObject(object) {
    const ret = super.parseObject(object);

    if (hasValue(ret.cvssV3Vector)) {
      ret.vector = ret.cvssV3Vector;
    } else if (hasValue(ret.cvssV2Vector)) {
      ret.vector = ret.cvssV2Vector;
    } else {
      ret.vector = null;
    }

    ret.severity = parseSeverity(ret.score / 10);

    return ret;
  }

  static parseElement(element) {
    const ret = super.parseElement(element, 'cve');

    if (isDefined(ret.update_time)) {
      ret.updateTime = parseDate(ret.update_time);
      delete ret.update_time;
    }
    ret.severity = parseSeverity(ret.severity);

    if (isDefined(ret.nvts)) {
      ret.nvtRefs = map(ret.nvts.nvt, nvt => {
        return setProperties({
          ...nvt,
          id: nvt._oid,
        });
      });
    }

    if (isDefined(ret.cert)) {
      ret.certRefs = map(ret.cert.cert_ref, ref => {
        return {
          name: ref.name,
          title: ref.title,
          type: ref._type,
        };
      });

      delete ret.cert;
    } else {
      ret.certRefs = [];
    }
    if (isEmpty(ret.cvss_vector)) {
      ret.cvss_vector = '';
    }
    if (ret.cvss_vector.includes('CVSS:3')) {
      ret.vector = parseCvssV3BaseFromVector(ret.cvss_vector);
    } else {
      ret.vector = parseCvssV2BaseFromVector(ret.cvss_vector);
    }

    ret.cvssVector = ret.cvss_vector;

    ret.products = isEmpty(ret.products) ? [] : ret.products.split(' ');

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

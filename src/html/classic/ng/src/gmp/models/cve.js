/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2017 Greenbone Networks GmbH
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

import {is_empty, is_defined, extend, map} from '../utils.js';

import {
  parse_severity,
  parse_cvss_base_vector,
  set_properties,
} from '../parser.js';

import Info from './info.js';

const delete_empty = (obj, props) => {
  for (const prop of props) {
    if (is_empty(obj[prop])) {
      delete obj[prop];
    }
  }
};

const rename_props = (obj, rename = {}) => {
  for (const [oldname, newname] of Object.entries(rename)) {
    if (is_defined(obj[oldname])) {
      obj[newname] = obj[oldname];
      delete obj[oldname];
    }
  }
};

class Cve extends Info {

  static info_type = 'cve';

  parseProperties(elem) {
    const ret = super.parseProperties(elem);

    if (elem.cve) { // we have an info element
      extend(ret, elem.cve);
      delete ret.cve;
    }

    if (is_defined(ret.update_time)) {
      ret.update_time = moment(ret.update_time);
    }

    ret.severity = parse_severity(ret.cvss);
    delete ret.cvss;

    if (is_defined(ret.nvts)) {
      ret.nvts = map(ret.nvts.nvt, nvt => {
        return set_properties({
          ...nvt,
          id: nvt._oid,
          oid: nvt._oid,
        });
      });
    }

    if (is_defined(ret.cert)) {
      ret.certs = map(ret.cert.cert_ref, ref => {
        return {
          name: ref.name,
          title: ref.title,
          cert_type: ref._type,
        };
      });

      delete ret.cert;
    }
    else {
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

    ret.cvss_base_vector = parse_cvss_base_vector({
      access_complexity: ret.complexity,
      access_vector: ret.vector,
      authentication: ret.authentication,
      availability_impact: ret.confidentiality_impact,
      confidentiality_impact: ret.confidentiality_impact,
      integrity_impact: ret.integrity_impact,
    });

    // use consistent names for cvss values
    rename_props(ret, {
      vector: 'cvss_access_vector',
      complexity: 'cvss_access_complexity',
      authentication: 'cvss_authentication',
      confidentiality_impact: 'cvss_confidentiality_impact',
      integrity_impact: 'cvss_integrity_impact',
      availability_impact: 'cvss_availability_impact',
    });

    if (is_empty(ret.products)) {
      ret.products = [];
    }
    else {
      ret.products = ret.products.split(' ');
    }

    if (is_defined(ret.raw_data) && is_defined(ret.raw_data.entry)) {
      const {entry} = ret.raw_data;

      if (is_defined(ret.cwe)) {
        ret.cwe_id = entry.cwe._id;
      }

      ret.published_time = moment(entry['published-datetime'].__text);
      ret.last_modified_time = moment(entry['last-modified-datetime'].__text);

      ret.references = map(entry.references, ref => ({
        name: ref.reference.__text,
        href: ref.reference._href,
        source: ref.source.__text,
        reference_type: ref._reference_type,
      }));

      if (is_defined(entry.cvss) && is_defined(entry.cvss.base_metrics) &&
        is_defined(entry.cvss.base_metrics.source)) {
        ret.source = entry.cvss.base_metrics.source.__text;
      }

      if (is_defined(entry.summary) && !is_empty(entry.summary.__text)) {
        // really don't know why entry.summary and ret.description can differ
        // but xslt did use the summary and and e.g. the description of
        // CVE-2017-2988 was empty but summary not
        ret.description = entry.summary.__text;
      }

      const products = entry['vulnerable-software-list'];
      if (is_defined(products)) {
        ret.products = map(products.product, product => product.__text);
      }

      delete ret.raw_data;
    }
    else {
      ret.references = [];
    }


    return ret;
  }
}

export default Cve;

// vim: set ts=2 sw=2 tw=80:

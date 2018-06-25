/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2016 - 2018 Greenbone Networks GmbH
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
import 'core-js/fn/string/starts-with';

import {is_defined, is_string} from '../utils/identity';
import {is_empty} from '../utils/string';
import {map} from '../utils/array';

import {parse_float, parse_severity} from '../parser.js';

import Info from './info.js';

export const TAG_NA = 'N/A';

const parse_tags = tags => {
  const newtags = {};

  if (tags) {
    const splited = tags.split('|');
    for (const t of splited) {
      const [key, value] = t.split('=');
      newtags[key] = value;
    }
  }

  return newtags;
};

const parse_ids = (ids, no) => {
  if (is_string(ids) && ids.length > 0 && ids !== no) {
    return ids.split(',').map(id => id.trim());
  }
  return [];
};

class Nvt extends Info {

  static info_type = 'nvt';

  parseProperties(elem) {
    const ret = super.parseProperties(elem, 'nvt');

    ret.nvt_type = elem._type;

    ret.oid = ret._oid;
    ret.id = ret.oid;
    ret.tags = parse_tags(ret.tags);

    // several properties use different names in different responses
    // cve and cve_id, bid and bugtraq_id, cert and cert_ref

    ret.cves = parse_ids(ret.cve, 'NOCVE')
      .concat(parse_ids(ret.cve_id, 'NOCVE'));
    delete ret.cve;
    delete ret.cve_id;

    ret.bids = parse_ids(ret.bid, 'NOBID')
      .concat(parse_ids(ret.bugtraq_id, 'NOBID'));
    delete ret.bid;
    delete ret.bugtraq_id;

    ret.severity = parse_severity(ret.cvss_base);
    delete ret.cvss_base;

    if (is_defined(ret.preferences)) {
      ret.preferences = map(ret.preferences.preference, preference => {
        const pref = {...preference};
        delete pref.nvt;
        return pref;
      });
    }
    else {
      ret.preferences = [];
    }

    if (is_defined(ret.cert)) {
      ret.certs = map(ret.cert.cert_ref, ref => {
        return {
          id: ref._id,
          type: ref._type,
        };
      });

      delete ret.cert;
    }
    else {
      ret.certs = [];
    }

    if (is_defined(ret.cert_refs)) {
      ret.certs.concat(
        map(ret.cert_refs.cert_ref, ref => {
          return {
            id: ref._id,
            type: ref._type,
          };
        })
      );

      delete ret.cert_refs;
    }

    const xrefs = parse_ids(ret.xrefs, 'NOXREF');

    ret.xrefs = xrefs.map(xref => {
      let type = 'other';
      let ref = xref;
      if (xref.startsWith('URL:')) {
        type = 'URL';
        ref = xref.slice(4);
      }
      return {type, ref};
    });

    delete ret.xref;

    if (is_defined(elem.qod)) {
      if (is_empty(elem.qod.value)) {
        delete ret.qod.value;
      }
      else {
        ret.qod.value = parse_float(elem.qod.value);
      }

      if (is_empty(elem.qod.type)) {
        delete ret.qod.type;
      }
    }

    if (is_empty(elem.default_timeout)) {
      delete ret.default_timeout;
    }
    else {
      ret.default_timeout = parse_float(elem.default_timeout);
    }

    if (is_empty(elem.timeout)) {
      delete ret.timeout;
    }
    else {
      ret.timeout = parse_float(elem.timeout);
    }

    return ret;
  }
}

export default Nvt;

// vim: set ts=2 sw=2 tw=80:

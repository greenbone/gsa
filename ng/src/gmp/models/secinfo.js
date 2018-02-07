/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2017 - 2018 Greenbone Networks GmbH
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

import _ from '../locale.js';
import {is_defined} from '../utils/identity';

import Info from './info.js';

export const secinfo_type = (type, unknown = _('N/A')) => {
  if (!is_defined(type)) {
    return unknown;
  }
  switch (type) {
    case 'cve':
      return _('CVE');
    case 'cpe':
      return _('CPE');
    case 'nvt':
      return _('NVT');
    case 'ovaldef':
      return _('OVAL Definition');
    case 'cert_bund_adv':
      return _('CERT-Bund Advisory');
    case 'dfn_cert_adv':
      return _('DFN-CERT Advisory');
    default:
      return type;
  }
};

class SecInfo extends Info {

  static info_type = 'allinfo';

  parseProperties(elem) {
    let ret = super.parseProperties(elem);

    if (elem.allinfo) { // we have an info element
      const {type, ...other} = elem.allinfo; // filter out type
      ret = {
        ...ret,
        ...other,
        _type: type,
      };
      delete ret.allinfo;
    }

    ret.info_type = ret._type;

    return ret;
  }
}

export default SecInfo;

// vim: set ts=2 sw=2 tw=80:

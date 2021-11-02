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
import {_} from 'gmp/locale/lang';

import {isDefined} from 'gmp/utils/identity';

import Info from './info';

export const secInfoTypeName = (type, unknown) => {
  if (!isDefined(unknown)) {
    unknown = _('N/A');
  }
  if (!isDefined(type)) {
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

export const secInfoType = entity => entity.infoType;

class SecInfo extends Info {
  static entityType = 'allinfo';

  static parseElement(element) {
    let ret = super.parseElement(element);

    if (element.allinfo) {
      // we have an info element
      const {type, ...other} = element.allinfo; // filter out type
      ret = {
        ...ret,
        ...other,
        _type: type,
      };
      delete ret.allinfo;
    }

    ret.infoType = ret._type;

    return ret;
  }
}

export default SecInfo;

// vim: set ts=2 sw=2 tw=80:

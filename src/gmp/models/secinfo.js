/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {_} from 'gmp/locale/lang';
import Info from 'gmp/models/info';
import {isDefined} from 'gmp/utils/identity';


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

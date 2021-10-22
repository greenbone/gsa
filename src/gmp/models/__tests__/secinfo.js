/* Copyright (C) 2018-2021 Greenbone Networks GmbH
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

import Info from 'gmp/models/info';
import SecInfo, {secInfoType, secInfoTypeName} from 'gmp/models/secinfo';
import {testModel} from 'gmp/models/testing';

testModel(SecInfo, 'allinfo');

describe('SecInfo model tests', () => {
  test('should be instance of Info', () => {
    const secInfo = SecInfo.fromElement({});

    expect(secInfo).toBeInstanceOf(Info);
  });

  test('should parse type', () => {
    const secInfo = SecInfo.fromElement({_type: 'nvt'});

    expect(secInfo.infoType).toEqual('nvt');
  });

  test('should filter out single info type', () => {
    const elem = {
      allinfo: {
        type: 'nvt',
        other: {},
      },
    };
    const secInfo = SecInfo.fromElement(elem);

    expect(secInfo.allInfo).toBeUndefined();
    expect(secInfo._type).toBeUndefined();
    expect(secInfo.infoType).toEqual('nvt');
    expect(secInfo.other).toEqual({});
  });
});

describe('SecInfo model function tests', () => {
  test('secInfoType should return infoType', () => {
    const secInfo1 = SecInfo.fromElement({allinfo: {type: 'nvt'}});
    const secInfo2 = SecInfo.fromElement({});

    expect(secInfoType(secInfo1)).toEqual('nvt');
    expect(secInfoType(secInfo2)).toBeUndefined();
  });

  test('secInfoTypeName should return type name strings', () => {
    expect(secInfoTypeName('cve')).toEqual('CVE');
    expect(secInfoTypeName('cpe')).toEqual('CPE');
    expect(secInfoTypeName('nvt')).toEqual('NVT');
    expect(secInfoTypeName('ovaldef')).toEqual('OVAL Definition');
    expect(secInfoTypeName('cert_bund_adv')).toEqual('CERT-Bund Advisory');
    expect(secInfoTypeName('dfn_cert_adv')).toEqual('DFN-CERT Advisory');
    expect(secInfoTypeName()).toEqual('N/A');
    expect(secInfoTypeName('foo')).toEqual('foo');
    expect(secInfoTypeName(undefined, 'other N/A')).toEqual('other N/A');
  });
});

// vim: set ts=2 sw=2 tw=80:

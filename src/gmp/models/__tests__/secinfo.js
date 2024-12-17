/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
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
    expect(secInfoTypeName('cert_bund_adv')).toEqual('CERT-Bund Advisory');
    expect(secInfoTypeName('dfn_cert_adv')).toEqual('DFN-CERT Advisory');
    expect(secInfoTypeName()).toEqual('N/A');
    expect(secInfoTypeName('foo')).toEqual('foo');
    expect(secInfoTypeName(undefined, 'other N/A')).toEqual('other N/A');
  });
});

// vim: set ts=2 sw=2 tw=80:

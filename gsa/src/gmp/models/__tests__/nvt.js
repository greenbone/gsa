/* Copyright (C) 2018 - 2019 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
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

/* eslint-disable max-len */

import Nvt from 'gmp/models/nvt';
import Info from 'gmp/models/info';
import {testNvtModel} from 'gmp/models/testing';

testNvtModel(Nvt, 'nvt');

describe('NVT model tests', () => {
  test('should be instance of Info', () => {
    const nvt = new Nvt({});

    expect(nvt).toBeInstanceOf(Info);
  });

  test('should parse nvt_type', () => {
    const nvt = new Nvt({_type: 'foo'});

    expect(nvt.nvtType).toEqual('foo');
  });

  test('should parse tags', () => {
    const nvt1 = new Nvt({tags: 'bv=/A:P|st=vf'});
    const nvt2 = new Nvt({});
    const res = {
      bv: '/A:P',
      st: 'vf',
    };

    expect(nvt1.tags).toEqual(res);
    expect(nvt2.tags).toEqual({});
  });

  test('should parse refs', () => {
    const elem = {
      refs: {
        ref: [
          {
            _id: 'cveId',
            _type: 'cve',
          },
          {
            _id: 'cve_idId',
            _type: 'cve_id',
          },
          {
            _id: 'bidId',
            _type: 'bid',
          },
          {
            _id: 'bugtraq_idId',
            _type: 'bugtraq_id',
          },
          {
            _id: 'dfn-certId',
            _type: 'dfn-cert',
          },
          {
            _id: 'DFN-certId',
            _type: 'DFN-cert',
          },
          {
            _id: 'cert-bundId',
            _type: 'cert-bund',
          },
          {
            _id: 'customId',
            _type: 'Custom-type',
          },
        ],
      },
    };
    const nvt1 = new Nvt(elem);
    const nvt2 = new Nvt({});

    expect(nvt1.cves).toEqual(['cveId', 'cve_idId']);
    expect(nvt2.cves).toEqual([]);
    expect(nvt1.bids).toEqual(['bidId', 'bugtraq_idId']);
    expect(nvt2.bids).toEqual([]);
    expect(nvt1.certs).toEqual([
      {id: 'dfn-certId', type: 'dfn-cert'},
      {id: 'DFN-certId', type: 'dfn-cert'},
      {id: 'cert-bundId', type: 'cert-bund'},
    ]);
    expect(nvt2.certs).toEqual([]);
    expect(nvt1.xrefs).toEqual([{ref: 'customId', type: 'custom-type'}]);
    expect(nvt2.xrefs).toEqual([]);
  });

  test('should parse severity', () => {
    const nvt1 = new Nvt({cvss_base: '8.5'});
    const nvt2 = new Nvt({cvss_base: ''});

    expect(nvt1.severity).toEqual(8.5);
    expect(nvt1.cvss_base).toBeUndefined();
    expect(nvt2.severity).toBeUndefined();
  });

  test('should parse preferences', () => {
    const elem = {
      preferences: {
        preference: [
          {
            nvt: '123',
            foo: 'bar',
            lorem: 'ipsum',
          },
        ],
      },
    };
    const res = [
      {
        foo: 'bar',
        lorem: 'ipsum',
      },
    ];
    const nvt1 = new Nvt({});
    const nvt2 = new Nvt(elem);

    expect(nvt1.preferences).toEqual([]);
    expect(nvt2.preferences).toEqual(res);
  });

  test('should parse xrefs with correct protocol', () => {
    const nvt1 = new Nvt({refs: {ref: [{_id: '42'}]}});
    const nvt2 = new Nvt({refs: {ref: [{_type: 'URL', _id: '42'}]}});
    const nvt3 = new Nvt({refs: {ref: [{_type: 'URL', _id: 'http://42'}]}});
    const nvt4 = new Nvt({refs: {ref: [{_type: 'URL', _id: 'https://42'}]}});
    const nvt5 = new Nvt({refs: {ref: [{_type: 'URL', _id: 'ftp://42'}]}});
    const nvt6 = new Nvt({refs: {ref: [{_type: 'URL', _id: 'ftps://42'}]}});
    const nvt7 = new Nvt({refs: {ref: [{_id: 'ftps://42'}]}});

    expect(nvt1.xrefs).toEqual([{ref: '42', type: 'other'}]);
    expect(nvt2.xrefs).toEqual([{ref: 'http://42', type: 'url'}]);
    expect(nvt3.xrefs).toEqual([{ref: 'http://42', type: 'url'}]);
    expect(nvt4.xrefs).toEqual([{ref: 'https://42', type: 'url'}]);
    expect(nvt5.xrefs).toEqual([{ref: 'ftp://42', type: 'url'}]);
    expect(nvt6.xrefs).toEqual([{ref: 'ftps://42', type: 'url'}]);
    expect(nvt7.xrefs).toEqual([{ref: 'ftps://42', type: 'other'}]);
    expect(nvt7.xref).toBeUndefined();
  });

  test('should parse qod', () => {
    const nvt1 = new Nvt({});
    const nvt2 = new Nvt({qod: {value: ''}});
    const nvt3 = new Nvt({qod: {value: '75.5'}});
    const nvt4 = new Nvt({qod: {type: ''}});
    const nvt5 = new Nvt({qod: {type: 'foo'}});
    const nvt6 = new Nvt({qod: {value: '75.5', type: 'foo'}});
    expect(nvt1.qod).toBeUndefined();
    expect(nvt2.qod.value).toBeUndefined();
    expect(nvt3.qod.value).toEqual(75.5);
    expect(nvt4.qod.type).toBeUndefined();
    expect(nvt5.qod.type).toEqual('foo');
    expect(nvt6.qod).toEqual({value: 75.5, type: 'foo'});
  });

  test('should parse default_timeout', () => {
    const nvt1 = new Nvt({});
    const nvt2 = new Nvt({default_timeout: ''});
    const nvt3 = new Nvt({default_timeout: '123'});

    expect(nvt1.default_timeout).toBeUndefined();
    expect(nvt2.default_timeout).toBeUndefined();
    expect(nvt3.default_timeout).toEqual(123);
  });

  test('should parse timeout', () => {
    const nvt1 = new Nvt({});
    const nvt2 = new Nvt({timeout: ''});
    const nvt3 = new Nvt({timeout: '123'});

    expect(nvt1.timeout).toBeUndefined();
    expect(nvt2.timeout).toBeUndefined();
    expect(nvt3.timeout).toEqual(123);
  });
});

/* Copyright (C) 2018 Greenbone Networks GmbH
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

    expect(nvt.nvt_type).toEqual('foo');
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

  test('should parse cve and cve_id', () => {
    const nvt1 = new Nvt({cve: '42', cve_id: '21'});
    const nvt2 = new Nvt({cve: '42, 21'});
    const nvt3 = new Nvt({cve: ''});
    const nvt4 = new Nvt({cve: 'NOCVE'});
    const nvt5 = new Nvt({});

    expect(nvt1.cves).toEqual(['42', '21']);
    expect(nvt1.cve).toBeUndefined();
    expect(nvt1.cve_id).toBeUndefined();
    expect(nvt2.cves).toEqual(['42', '21']);
    expect(nvt3.cves).toEqual([]);
    expect(nvt4.cves).toEqual([]);
    expect(nvt5.cves).toEqual([]);
  });

  test('should parse bid and bugtraq_id', () => {
    const nvt1 = new Nvt({bid: '42', bugtraq_id: '21'});
    const nvt2 = new Nvt({bid: '42, 21'});
    const nvt3 = new Nvt({bid: ''});
    const nvt4 = new Nvt({bid: 'NOBID'});
    const nvt5 = new Nvt({});

    expect(nvt1.bids).toEqual(['42', '21']);
    expect(nvt1.bid).toBeUndefined();
    expect(nvt1.bugtraq_id).toBeUndefined();
    expect(nvt2.bids).toEqual(['42', '21']);
    expect(nvt3.bids).toEqual([]);
    expect(nvt4.bids).toEqual([]);
    expect(nvt5.bids).toEqual([]);
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

  test('should parse cert and cert_refs', () => {
    const elem2 = {
      cert: {
        cert_ref: [
          {
            _id: '123',
            _type: 'foo',
          },
          {
            _id: '456',
            _type: 'bar',
          },
        ],
      },
    };
    const res2 = [
      {
        id: '123',
        type: 'foo',
      },
      {
        id: '456',
        type: 'bar',
      },
    ];
    const elem3 = {
      cert_refs: {
        cert_ref: [
          {
            _id: '123',
            _type: 'foo',
          },
        ],
      },
    };
    const res3 = [
      {
        id: '123',
        type: 'foo',
      },
    ];
    const elem4 = {
      cert: {
        cert_ref: [
          {
            _id: '1',
            _type: 'foo',
          },
        ],
      },
      cert_refs: {
        cert_ref: [
          {
            _id: '2',
            _type: 'bar',
          },
        ],
      },
    };
    const res4 = [
      {
        id: '1',
        type: 'foo',
      },
      {
        id: '2',
        type: 'bar',
      },
    ];

    const nvt1 = new Nvt({});
    const nvt2 = new Nvt(elem2);
    const nvt3 = new Nvt(elem3);
    const nvt4 = new Nvt(elem4);

    expect(nvt1.certs).toEqual([]);
    expect(nvt2.cert).toBeUndefined();
    expect(nvt2.certs).toEqual(res2);
    expect(nvt3.certs).toEqual(res3);
    expect(nvt3.cert_refs).toBeUndefined();
    expect(nvt4.certs).toEqual(res4);
  });

  test('should parse xrefs with correct protocol', () => {
    const nvt1 = new Nvt({xrefs: '42'});
    const nvt2 = new Nvt({xrefs: '42, 21'});
    const nvt3 = new Nvt({xrefs: 'URL:42'});
    const nvt4 = new Nvt({xrefs: 'URL:http://42'});
    const nvt5 = new Nvt({xrefs: 'URL:https://42'});
    const nvt6 = new Nvt({xrefs: 'URL:ftp://42'});
    const nvt7 = new Nvt({xrefs: 'URL:ftps://42'});
    const nvt8 = new Nvt({xrefs: 'ftps://42'});

    expect(nvt1.xrefs).toEqual([{ref: '42', type: 'other'}]);
    expect(nvt2.xrefs).toEqual([
      {ref: '42', type: 'other'},
      {ref: '21', type: 'other'},
    ]);
    expect(nvt3.xrefs).toEqual([{ref: 'http://42', type: 'URL'}]);
    expect(nvt4.xrefs).toEqual([{ref: 'http://42', type: 'URL'}]);
    expect(nvt5.xrefs).toEqual([{ref: 'https://42', type: 'URL'}]);
    expect(nvt6.xrefs).toEqual([{ref: 'ftp://42', type: 'URL'}]);
    expect(nvt7.xrefs).toEqual([{ref: 'ftps://42', type: 'URL'}]);
    expect(nvt8.xrefs).toEqual([{ref: 'ftps://42', type: 'other'}]);
    expect(nvt8.xref).toBeUndefined();
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

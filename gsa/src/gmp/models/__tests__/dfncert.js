/* Copyright (C) 2018-2019 Greenbone Networks GmbH
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

import DfnCertAdv from 'gmp/models/dfncert';
import Info from 'gmp/models/info';
import {testModel} from 'gmp/models/testing';

testModel(DfnCertAdv, 'dfncert');

describe('DfnCertAdv model tests', () => {
  test('should be instance of Info', () => {
    const dfnCertAdv = new DfnCertAdv({});

    expect(dfnCertAdv).toBeInstanceOf(Info);
  });

  test('should parse severity correctly', () => {
    const dfnCertAdv = new DfnCertAdv({max_cvss: '5.0'});
    const dfnCertAdv2 = new DfnCertAdv({max_cvss: '10'});

    expect(dfnCertAdv.max_cvss).toBeUndefined();
    expect(dfnCertAdv.severity).toEqual(5.0);
    expect(dfnCertAdv2.severity).toEqual(10);
  });

  test('should parse advisory links', () => {
    const elem = {
      raw_data: {
        entry: {
          link: [
            {
              _rel: 'alternate',
              _href: 'prot://url',
            },
            {
              _href: 'prot://url2',
            },
            {
              _href: 'prot://url3',
            },
          ],
        },
      },
    };
    const dfnCertAdv = new DfnCertAdv(elem);

    expect(dfnCertAdv.advisory_link).toEqual('prot://url');
    expect(dfnCertAdv.additional_links).toEqual(['prot://url2', 'prot://url3']);
  });

  test('should parse summary', () => {
    const elem = {
      raw_data: {
        entry: {
          summary: {
            __text: 'foo',
          },
        },
      },
    };
    const dfnCertAdv = new DfnCertAdv(elem);

    expect(dfnCertAdv.summary).toEqual('foo');
  });

  test('should parse CVEs', () => {
    const elem = {
      raw_data: {
        entry: {
          cve: [{__text: 'lorem'}, {__text: 'ipsum'}, {__text: 'dolor'}],
        },
      },
    };
    const dfnCertAdv = new DfnCertAdv(elem);

    expect(dfnCertAdv.cves).toEqual(['lorem', 'ipsum', 'dolor']);
  });
});

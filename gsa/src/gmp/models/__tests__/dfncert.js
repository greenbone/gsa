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

import DfnCertAdv from 'gmp/models/dfncert';
import Info from 'gmp/models/info';
import {testModel} from 'gmp/models/testing';

testModel(DfnCertAdv, 'dfncert');

describe('DfnCertAdv model tests', () => {
  test('should be instance of Info', () => {
    const dfnCertAdv = DfnCertAdv.fromElement({});

    expect(dfnCertAdv).toBeInstanceOf(Info);
  });

  test('should parse severity correctly', () => {
    const dfnCertAdv = DfnCertAdv.fromElement({score: '50'});
    const dfnCertAdv2 = DfnCertAdv.fromElement({score: '100'});

    expect(dfnCertAdv.score).toBeUndefined();
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
    const dfnCertAdv = DfnCertAdv.fromElement(elem);

    expect(dfnCertAdv.advisoryLink).toEqual('prot://url');
    expect(dfnCertAdv.additionalLinks).toEqual(['prot://url2', 'prot://url3']);
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
    const dfnCertAdv = DfnCertAdv.fromElement(elem);

    expect(dfnCertAdv.summary).toEqual('foo');
  });

  test('should parse CVEs', () => {
    const elem = {
      raw_data: {
        entry: {
          cve: ['lorem', 'ipsum', 'dolor'],
        },
      },
    };
    const dfnCertAdv = DfnCertAdv.fromElement(elem);

    expect(dfnCertAdv.cves).toEqual(['lorem', 'ipsum', 'dolor']);
  });
});

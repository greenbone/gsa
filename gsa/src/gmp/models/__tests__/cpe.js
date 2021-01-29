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

import Cpe from 'gmp/models/cpe';
import {isDate} from 'gmp/models/date';
import {testModel} from 'gmp/models/testing';

testModel(Cpe, 'cpe');

describe('CPE model tests', () => {
  test('should parse severity correctly', () => {
    const cpe = Cpe.fromElement({score: '50'});
    const cpe2 = Cpe.fromElement({score: '100'});

    expect(cpe.score).toBeUndefined();
    expect(cpe.severity).toEqual(5.0);
    expect(cpe2.severity).toEqual(10);
  });

  test('should parse "(null)" score as undefined severity', () => {
    const cpe = Cpe.fromElement({score: '(null)'});

    expect(cpe.severity).toBeUndefined();
  });

  test('should parse id and severity of cves', () => {
    const elem = {
      cves: {
        cve: [
          {
            entry: {
              _id: '1337',
              cvss: {
                base_metrics: {
                  score: '9.0',
                },
              },
            },
          },
          {
            entry: {
              _id: '42',
              cvss: {
                base_metrics: {
                  score: '9.5',
                },
              },
            },
          },
        ],
      },
    };
    const cpe = Cpe.fromElement(elem);

    expect(cpe.cves).toEqual([
      {
        id: '1337',
        severity: 9.0,
      },
      {
        id: '42',
        severity: 9.5,
      },
    ]);
  });

  test('should return empty array if no cves are defined', () => {
    const cpe = Cpe.fromElement({});

    expect(cpe.cves).toEqual([]);
  });

  test('should return undefined if status is empty', () => {
    const cpe = Cpe.fromElement({status: ''});
    const cpe2 = Cpe.fromElement({status: 'foo'});

    expect(cpe.status).toBeUndefined();
    expect(cpe2.status).toEqual('foo');
  });

  test('should parse update_time as date', () => {
    const cpe = Cpe.fromElement({update_time: '2018-10-10T11:41:23.022Z'});

    expect(cpe.updateTime).toBeDefined();
    expect(cpe.update_time).toBeUndefined();
    expect(isDate(cpe.updateTime)).toBe(true);
  });
});

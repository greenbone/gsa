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

import Cpe from 'gmp/models/cpe';
import {isDate} from 'gmp/models/date';
import {testModel} from 'gmp/models/testing';

testModel(Cpe, 'cpe');

describe('CPE model tests', () => {
  test('should parse severity correctly', () => {
    const cpe = new Cpe({max_cvss: '5.0'});
    const cpe2 = new Cpe({max_cvss: '10'});

    expect(cpe.max_cvss).toBeUndefined();
    expect(cpe.severity).toEqual(5.0);
    expect(cpe2.severity).toEqual(10);
  });

  test('should parse "(null)" max_cvss as undefined severity', () => {
    const cpe = new Cpe({max_cvss: '(null)'});

    expect(cpe.severity).toBeUndefined();
  });

  test('should parse id and severity of cves', () => {
    const elem = {
      cves: {
        cve: {
          entry: [
            {
              _id: '1337',
              cvss: {
                base_metrics: {
                  score: {
                    __text: '9.0',
                  },
                },
              },
            },
            {
              _id: '42',
              cvss: {
                base_metrics: {
                  score: {
                    __text: '9.5',
                  },
                },
              },
            },
          ],
        },
      },
    };
    const cpe = new Cpe(elem);

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
    const cpe = new Cpe({});

    expect(cpe.cves).toEqual([]);
  });

  test('should return undefined if status is empty', () => {
    const cpe = new Cpe({status: ''});
    const cpe2 = new Cpe({status: 'foo'});

    expect(cpe.status).toBeUndefined();
    expect(cpe2.status).toEqual('foo');
  });

  test('should parse update_time as date', () => {
    const cpe = new Cpe({update_time: '2018-10-10T11:41:23.022Z'});

    expect(cpe.updateTime).toBeDefined();
    expect(cpe.update_time).toBeUndefined();
    expect(isDate(cpe.updateTime)).toBe(true);
  });
});

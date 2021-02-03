/* Copyright (C) 2021 Greenbone Networks GmbH
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

import {deepFreeze, createGenericQueryMock} from 'web/utils/testing';
import {GET_HOST} from '../hosts';

export const host = deepFreeze({
  id: '12345',
  name: 'Foo',
  comment: 'bar',
  owner: {name: 'admin'},
  creationTime: '2019-06-02T12:00:22Z',
  modificationTime: '2019-06-03T11:00:22Z',
  writable: true,
  inUse: false,
  permissions: [{name: 'everything'}],
  severity: 10.0,
  details: [
    {
      name: 'best_os_cpe',
      value: 'cpe:/o:linux:kernel',
      source: {
        type: 'Report',
        description: null,
      },
      extra: null,
    },
    {
      name: 'best_os_txt',
      value: 'Linux/Unix',
      source: {
        type: 'Report',
        description: null,
      },
      extra: null,
    },
    {
      name: 'traceroute',
      value: '123.456.789.10,123.456.789.11',
      source: {
        type: 'Report',
        description: null,
      },
      extra: null,
    },
  ],
  routes: [
    {
      hosts: [
        {
          id: '10',
          ip: '123.456.789.10',
          distance: null,
          sameSource: null,
        },
        {
          id: '01',
          ip: '123.456.789.11',
          distance: null,
          sameSource: null,
        },
      ],
    },
  ],
  identifiers: [
    {
      id: '5678',
      name: 'hostname',
      value: 'foo',
      creationTime: '2019-06-02T12:00:22Z',
      modificationTime: '2019-06-03T11:00:22Z',
      sourceId: '910',
      sourceType: 'Report Host Detail',
      sourceData: '1.2.3.4.5',
      sourceName: null,
      sourceDeleted: null,
      osId: null,
      osTitle: null,
    },
    {
      id: '1112',
      name: 'ip',
      value: '123.456.789.10',
      creationTime: '2019-06-02T12:00:22Z',
      modificationTime: '2019-06-03T11:00:22Z',
      sourceId: '910',
      sourceType: 'Report Host Detail',
      sourceData: '1.2.3.4.5',
      sourceName: null,
      sourceDeleted: null,
      osId: null,
      osTitle: null,
    },
    {
      id: '1314',
      name: 'OS',
      value: 'cpe:/o:linux:kernel',
      creationTime: '2019-06-02T12:00:22Z',
      modificationTime: '2019-06-03T11:00:22Z',
      sourceId: '910',
      sourceType: 'Report Host Detail',
      sourceData: '1.2.3.4.5',
      sourceName: null,
      sourceDeleted: null,
      osId: '1314',
      osTitle: 'TestOs',
    },
  ],
});

export const createGetHostQueryMock = (id = '12345', result = host) =>
  createGenericQueryMock(GET_HOST, {host: result}, {id});

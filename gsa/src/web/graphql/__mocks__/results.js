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

import {createGenericQueryMock, deepFreeze} from 'web/utils/testing';
import {GET_RESULT} from '../results';

export const mockResult = deepFreeze({
  id: '12345',
  name: 'foo',
  comment: null,
  owner: 'admin',
  creationTime: '2019-06-02T12:00:00Z',
  modificationTime: '2019-06-03T11:00:00Z',
  type: 'NVT',
  originResult: {
    id: '12345',
    details: [
      {
        name: 'product',
        value: 'cpe:/a:python:python:2.7.16',
      },
      {
        name: 'location',
        value: '/usr/bin/python, /usr/bin/python2.7',
      },
      {
        name: 'source_oid',
        value: 'CVE-2019-13404',
      },
      {
        name: 'source_name',
        value: 'CVE-2019-13404',
      },
    ],
  },
  report: {
    id: '314',
  },
  task: {
    id: '159',
    name: 'task 1',
  },
  host: {
    id: '265',
    ip: '109.876.54.321',
    hostname: 'lorem',
  },
  location: '80/tcp',
  information: {
    id: '1.3.6.1.4.1.25623.1.12345',
    name: 'nvt1',
    score: 50,
    severities: {
      type: null,
      score: 50,
      vector: 'AV:N/AC:M/Au:N/C:P/I:N/A:N',
    },
    tags: {
      cvssBaseVector: 'AV:N/AC:M/Au:S/C:P/I:N/A:P',
      summary: 'This is a mock result',
      solutionType: 'VendorFix',
      insight: 'This is just a test',
      impact: 'No real impact',
      detectionMethod: 'This is the detection method',
      affected: 'Affects test cases only',
    },
    cveReferences: [{type: 'cve', id: 'CVE-2019-1234'}],
    certReferences: [
      {type: 'cert-bund', id: 'CB-K12/3456'},
      {type: 'dfn-cert', id: 'DFN-CERT-2019-1234'},
    ],
    bidReferences: [
      {type: 'bid', id: '75750'},
      {type: 'bugtraq_id', id: '75751'},
    ],
    otherReferences: [{type: 'url', id: 'https://www.foo.bar'}],
    solution: {
      type: 'VendorFix',
      method: null,
      description: 'Keep writing tests',
    },
  },
  description: 'This is a description',
  originalSeverity: 5.0,
  qod: {value: 80, type: 'registry'},
  severity: 5.0,
  notes: [
    {
      id: '358',
      creationTime: '2019-06-02T12:05:00Z',
      modificationTime: '2019-06-03T11:05:00Z',
      active: true,
      text: 'Very important note',
    },
  ],
  tickets: [{id: '979'}],
  overrides: null,
  userTags: null,
});

export const createGetResultQueryMock = (
  resultId = '12345',
  result = mockResult,
) => createGenericQueryMock(GET_RESULT, {result}, {id: resultId});

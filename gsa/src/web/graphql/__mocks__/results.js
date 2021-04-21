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
  owner: 'admin',
  creationTime: '2019-06-02T12:00:00Z',
  modificationTime: '2019-06-03T11:00:00Z',
  type: 'NVT',
  overrides: [
    {
      id: '6f1249cd-6c48-43e5-bf4f-2a11cb28fbbd',
      active: true,
      severity: 6.4,
      newSeverity: 4.3,
      text: 'hello world',
      endTime: null,
      modificationTime: '2021-04-11T11:30:46+00:00',
    },
  ],
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
    // if you use UnionType you MUST declare __typename or MockedProvider will make this information object empty
    __typename: 'ResultNVT',
    id: '1.3.6.1.4.1.25623.1.12345',
    name: 'nvt1',
    version: null,
    score: 50,
    severities: [
      {
        type: 'cvss_base_v2',
        score: 50,
        vector: 'AV:N/AC:M/Au:N/C:P/I:N/A:N',
      },
    ],
    cveReferences: [{type: 'cve', id: 'CVE-2019-1234'}],
    bidReferences: [
      {type: 'bid', id: '75750'},
      {type: 'bugtraq_id', id: '75751'},
    ],
    certReferences: [
      {type: 'cert-bund', id: 'CB-K12/3456'},
      {type: 'dfn-cert', id: 'DFN-CERT-2019-1234'},
    ],
    otherReferences: [{type: 'url', id: 'https://www.foo.bar'}],
    tags: {
      cvssBaseVector: 'AV:N/AC:M/Au:S/C:P/I:N/A:P',
      summary: 'This is a mock result',
      insight: 'This is just a test',
      impact: 'No real impact',
      detectionMethod: 'This is the detection method',
      affected: 'Affects test cases only',
    },
    solution: {
      type: 'VendorFix',
      method: null,
      description: 'Keep writing tests',
    },
  },
  originalSeverity: 5.0,
  severity: 5.0,
  qod: {value: 80, type: 'registry'},
  description: 'This is a description',
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
  userTags: null,
});

export const createGetResultQueryMock = (
  resultId = '12345',
  result = mockResult,
) => createGenericQueryMock(GET_RESULT, {result}, {id: resultId});

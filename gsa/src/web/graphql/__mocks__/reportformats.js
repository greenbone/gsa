/* Copyright (C) 2020-2021 Greenbone Networks GmbH
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

import {GET_REPORT_FORMATS} from '../reportformats';

export const reportFormat1 = deepFreeze({
  id: '665',
  name: 'foo',
  owner: 'admin',
  comment: 'comm',
  writable: true,
  inUse: true,
  creationTime: '2020-08-17T12:07:28+00:00',
  modificationTime: '2020-09-29T12:16:51+00:00',
  permissions: [{name: 'get_alerts'}],
  userTags: {
    count: 1,
    tags: [
      {
        name: 'sometag',
        id: '235',
        value: 'november',
        comment: 'nocomment',
      },
    ],
  },
  summary: 'source',
  description: 'desc',
  predefined: true,
  trust: 'yes',
  trustTime: '2020-08-17T14:07:27+02:00',
  active: false,
  extension: 'xml',
});

export const reportFormat2 = deepFreeze({
  id: '789',
  name: 'bar',
  owner: 'admin',
  comment: 'lorem ipsum',
  writable: true,
  inUse: true,
  creationTime: '2020-08-17T12:07:28+00:00',
  modificationTime: '2020-09-29T12:16:51+00:00',
  permissions: [{name: 'Everything'}],
  userTags: null,
  summary: 'something happened',
  description: 'desc',
  predefined: true,
  trust: 'yes',
  trustTime: '2020-08-17T14:07:27+02:00',
  active: false,
  extension: 'xml',
});

const mockReportFormats = {
  edges: [
    {
      node: reportFormat1,
    },
    {
      node: reportFormat2,
    },
  ],
  counts: {
    total: 2,
    filtered: 2,
    offset: 0,
    limit: 10,
    length: 2,
  },
  pageInfo: {
    hasNextPage: false,
    hasPreviousPage: false,
    startCursor: 'YWxlcnQ6MA==',
    endCursor: 'YWxlcnQ6OQ==',
    lastPageCursor: 'YWxlcnQ6MA==',
  },
};

export const createGetReportFormatsQueryMock = variables =>
  createGenericQueryMock(
    GET_REPORT_FORMATS,
    {reportFormats: mockReportFormats},
    variables,
  );

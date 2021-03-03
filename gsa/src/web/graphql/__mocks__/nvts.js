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

import {
  GET_NVTS,
  GET_NVT,
  EXPORT_NVTS_BY_IDS,
  EXPORT_NVTS_BY_FILTER,
} from '../nvts';

export const nvtEntity = deepFreeze({
  id: '12345',
  name: '12345',
  comment: '',
  writable: 0,
  owner: null,
  inUse: 0,
  creationTime: '2019-06-24T11:55:30Z',
  modificationTime: '2019-06-24T10:12:27Z',
  updateTime: '2020-10-30T11:44:00.000+0000',
  permissions: null,
  userTags: null,
  category: 3,
  family: 'bar',
  cvssBase: 4.9,
  qod: {
    value: 80,
    type: 'remote_banner',
  },
  severities: {
    score: 49,
    severitiesList: [
      {
        date: '2020-10-30T11:44:00.000+0000',
        origin: null,
        score: 49,
        type: '',
        vector: '',
      },
    ],
  },
  refs: {
    warning: null,
    refList: [
      {type: 'cve', id: 'CVE-2020-1234'},
      {type: 'cve', id: 'CVE-2020-5678'},
    ],
  },
  tags: {
    cvssBaseVector: 'AV:N/AC:M/Au:S/C:P/I:N/A:P',
    summary: 'This is a description',
    solutionType: 'VendorFix',
    insight: 'Foo',
    impact: 'Bar',
    vuldetect: 'Baz',
    affected: 'foo',
  },
  preferencesCount: -1,
  preferences: {
    nvt: null,
    hrName: 'meh',
    name: 'meh',
    id: 1,
    type: 'ratio',
    alt: ['moo'],
    default: 'miau',
    value: 'miau',
  },
  timeout: null,
  defaultTimeout: null,
  solution: {
    type: 'VendorFix',
    description: 'This is a description',
    method: null,
  },
});

const mockNvts = {
  edges: [
    {
      node: nvtEntity,
    },
  ],
  counts: {
    total: 1,
    filtered: 1,
    offset: 0,
    limit: 10,
    length: 1,
  },
  pageInfo: {
    hasNextPage: false,
    hasPreviousPage: false,
    startCursor: 'c2NoZWR1bGU6MA==',
    endCursor: 'c2NoZWR1bGU6MA==',
    lastPageCursor: 'c2NoZWR1bGU6MA==',
  },
};

export const createGetNvtQueryMock = (id = '12345', result = nvtEntity) =>
  createGenericQueryMock(GET_NVT, {nvt: result}, {id});

export const createGetNvtsQueryMock = (variables = {}) =>
  createGenericQueryMock(GET_NVTS, {nvts: mockNvts}, variables);

const exportNvtsByIds = {
  exportNvtsByIds: {
    exportedEntities:
      '<get_info_list_response status="200" status_text="OK" />',
  },
};

export const createExportNvtsByIdsQueryMock = (nvtIds = ['12345']) =>
  createGenericQueryMock(EXPORT_NVTS_BY_IDS, exportNvtsByIds, {ids: nvtIds});

const exportNvtsByFilter = {
  exportNvtsByFilter: {
    exportedEntities:
      '<get_info_list_response status="200" status_text="OK" />',
  },
};

export const createExportNvtsByFilterQueryMock = (filterString = 'foo') =>
  createGenericQueryMock(EXPORT_NVTS_BY_FILTER, exportNvtsByFilter, {
    filterString,
  });

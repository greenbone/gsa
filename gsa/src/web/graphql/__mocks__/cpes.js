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
  EXPORT_CPES_BY_FILTER,
  EXPORT_CPES_BY_IDS,
  GET_CPE,
  GET_CPES,
} from '../cpes';

export const cpeEntity = deepFreeze({
  id: 'cpe:/a:foo',
  name: 'foo',
  comment: 'Funny Bug',
  writable: false,
  owner: null,
  inUse: null,
  creationTime: '2020-08-17T12:18:14+00:00',
  modificationTime: '2020-09-29T12:16:50+00:00',
  permissions: null,
  userTags: null,
  updateTime: '2020-09-29T12:16:50+00:00',
  title: 'bar',
  nvdId: '1234',
  cveRefCount: '3',
  cveRefs: [
    {
      id: 'CVE-2020-1234',
      severity: 5.4,
    },
    {
      id: 'CVE-2020-5678',
      severity: 9.8,
    },
    {
      id: 'CVE-2019-5678',
      severity: 1.8,
    },
  ],
  deprecatedBy: 'cpe:/a:foo:bar',
  score: 98,
  status: 'FINAL',
});

const mockCpes = {
  edges: [
    {
      node: cpeEntity,
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
    startCursor: 'YWxlcnQ6MA==',
    endCursor: 'YWxlcnQ6OQ==',
    lastPageCursor: 'YWxlcnQ6MA==',
  },
};

export const createGetCpeQueryMock = (id = 'cpe:/a:foo', result = cpeEntity) =>
  createGenericQueryMock(GET_CPE, {cpe: result}, {id});

export const createGetCpesQueryMock = (variables = {}) =>
  createGenericQueryMock(GET_CPES, {cpes: mockCpes}, variables);

const exportCpesByIds = {
  exportCpesByIds: {
    exportedEntities:
      '<get_info_list_response status="200" status_text="OK" />',
  },
};

export const createExportCpesByIdsQueryMock = (cpeIds = ['cpe:/a:foo']) =>
  createGenericQueryMock(EXPORT_CPES_BY_IDS, exportCpesByIds, {ids: cpeIds});

const exportCpesByFilter = {
  exportCpesByFilter: {
    exportedEntities:
      '<get_info_list_response status="200" status_text="OK" />',
  },
};

export const createExportCpesByFilterQueryMock = (filterString = 'foo') =>
  createGenericQueryMock(EXPORT_CPES_BY_FILTER, exportCpesByFilter, {
    filterString,
  });

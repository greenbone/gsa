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
  EXPORT_CVES_BY_FILTER,
  EXPORT_CVES_BY_IDS,
  GET_CVE,
  GET_CVES,
} from '../cves';

export const cveEntity = deepFreeze({
  id: 'CVE-314',
  name: 'foo',
  comment: 'Funny Bug',
  owner: null,
  writable: false,
  inUse: null,
  creationTime: '2020-08-17T12:18:14+00:00',
  modificationTime: '2020-09-29T12:16:50+00:00',
  permissions: null,
  userTags: null,
  updateTime: '2020-09-29T12:16:50+00:00',
  cvssVector: 'CVSS:3.1/AV:L/AC:L/PR:N/UI:R/S:U/C:H/I:N/A:N',
  score: 55,
  cvssV2Vector: {
    integrity: 'NONE',
    accessComplexity: 'MEDIUM',
    availability: 'NONE',
    vector: 'AV:N/AC:M/Au:N/C:P/I:N/A:N',
    confidentiality: 'PARTIAL',
    accessVector: 'NETWORK',
    authentication: 'NONE',
    baseScore: 4.3,
  },
  cvssV3Vector: {
    availability: 'NONE',
    attackComplexity: 'LOW',
    vector: 'CVSS:3.1/AV:L/AC:L/PR:N/UI:R/S:U/C:H/I:N/A:N',
    integrity: 'NONE',
    userInteraction: 'REQUIRED',
    baseScore: 5.5,
    attackVector: 'LOCAL',
    privilegesRequired: 'NONE',
    scope: 'UNCHANGED',
    confidentiality: 'HIGH',
  },
  certRefs: [
    {
      type: 'CERT-Bund',
      name: 'CB-1',
      title: 'blooob',
    },
    {
      type: 'CERT-Bund',
      name: 'CB-2',
      title: 'foo',
    },
  ],
  nvtRefs: [
    {
      id: '1.2.3',
      name: 'baz',
    },
    {
      id: '1.2.3',
      name: 'yiggel',
    },
  ],
  description:
    'An information disclosure issue was addressed with improved state management. This issue is fixed in macOS Catalina 10.15.6, watchOS 6.2.8. A malicious application may disclose restricted memory.',
  products: ['cpe:/o:apple:mac_os_x:10.15.5 cpe:/o:apple:watchos:6.2.8'],
});

const mockCves = {
  edges: [
    {
      node: cveEntity,
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

export const createGetCveQueryMock = (id = 'CVE-314', result = cveEntity) =>
  createGenericQueryMock(GET_CVE, {cve: result}, {id});

export const createGetCvesQueryMock = (variables = {}) =>
  createGenericQueryMock(GET_CVES, {cves: mockCves}, variables);

const exportCvesByIds = {
  exportScanConfigsByIds: {
    exportedEntities:
      '<get_info_list_response status="200" status_text="OK" />',
  },
};

export const createExportCvesByIdsQueryMock = (cveIds = ['CVE-314']) =>
  createGenericQueryMock(EXPORT_CVES_BY_IDS, exportCvesByIds, {ids: cveIds});

const exportCvesByFilter = {
  exportScanConfigsByFilter: {
    exportedEntities:
      '<get_info_list_response status="200" status_text="OK" />',
  },
};

export const createExportCvesByFilterQueryMock = (filterString = 'foo') =>
  createGenericQueryMock(EXPORT_CVES_BY_FILTER, exportCvesByFilter, {
    filterString,
  });

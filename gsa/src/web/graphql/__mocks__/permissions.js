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

import {GET_PERMISSIONS} from '../permissions';

export const perm1 = deepFreeze({
  id: '132',
  comment: 'olympics',
  name: 'get_foo',
  writable: true,
  inUse: false,
  creationTime: '2020-11-17T14:43:35+00:00',
  modificationTime: '2020-11-17T14:43:35+00:00',
  owner: 'admin',
  permissions: [{name: 'Everything'}],
  resource: {
    deleted: false,
    name: 'alert 1',
    permissions: [{name: 'get_alerts'}],
    trash: false,
    id: '1',
    type: 'alert',
  },
  subject: {
    id: '234',
    name: 'admin',
    trash: false,
    type: 'user',
  },
  userTags: {
    count: 1,
    tags: [
      {
        name: 'alert:unnamed',
        id: '12343',
        value: null,
        comment: 'real',
      },
    ],
  },
});

export const perm2 = deepFreeze({
  id: '434',
  comment: null,
  name: 'get_bar',
  writable: false,
  inUse: true,
  creationTime: '2020-11-17T14:43:42+00:00',
  modificationTime: '2020-11-17T14:43:42+00:00',
  owner: 'admin',
  permissions: [{name: 'Everything'}],
  resource: {
    deleted: false,
    name: 'alert 1',
    permissions: [{name: 'get_alerts'}],
    trash: false,
    id: '1',
    type: 'alert',
  },
  subject: {
    id: '344',
    name: 'stormtroopers',
    trash: false,
    type: 'role',
  },
  userTags: {
    count: 1,
    tags: [
      {
        name: 'somedummyname',
        id: '4346',
        value: null,
        comment: 'fake',
      },
    ],
  },
});

const mockPermissions = {
  edges: [
    {
      node: perm1,
    },
    {
      node: perm2,
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

export const noPermissions = {
  edges: [],
  counts: {
    total: 10,
    filtered: 0,
    offset: 0,
    limit: 10,
    length: 0,
  },
  pageInfo: {
    hasNextPage: false,
    hasPreviousPage: false,
    startCursor: 'YWxlcnQ6MA==',
    endCursor: 'YWxlcnQ6OQ==',
    lastPageCursor: 'YWxlcnQ6MA==',
  },
};

export const createGetPermissionsQueryMock = (
  variables,
  results = mockPermissions,
) => createGenericQueryMock(GET_PERMISSIONS, {permissions: results}, variables);

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

import {
  CLONE_OVERRIDE,
  DELETE_OVERRIDES_BY_IDS,
  DELETE_OVERRIDES_BY_FILTER,
  EXPORT_OVERRIDES_BY_IDS,
  EXPORT_OVERRIDES_BY_FILTER,
  GET_OVERRIDE,
  GET_OVERRIDES,
  CREATE_OVERRIDE,
  MODIFY_OVERRIDE,
} from '../overrides';

export const detailsOverride = deepFreeze({
  id: '456',
  active: true,
  creationTime: '2021-02-19T14:14:11Z',
  endTime: '2021-12-23T14:14:11Z',
  hosts: ['127.0.0.1', '127.0.0.2'],
  inUse: false,
  modificationTime: '2021-01-04T11:54:12Z',
  newSeverity: '9.0',
  nvt: {
    id: '123',
    name: 'foo nvt',
  },
  owner: 'admin',
  result: {
    id: '1337',
    name: 'result name',
  },
  permissions: [{name: 'Everything'}],
  port: '66/tcp',
  severity: '5.0',
  task: {
    id: '42',
    name: 'task x',
  },
  text: 'override text',
  userTags: {
    count: 1,
    tags: [
      {
        id: '123',
        name: 'override:unnamed',
        value: null,
        comment: null,
      },
    ],
  },
  writable: true,
});

export const noPermOverride = deepFreeze({
  id: '456',
  active: true,
  creationTime: '2020-12-23T14:14:11Z',
  endTime: '2021-12-23T14:14:11Z',
  hosts: ['127.0.0.1', '127.0.0.2'],
  inUse: false,
  modificationTime: '2021-01-04T11:54:12Z',
  nvt: {
    id: '123',
    name: 'foo nvt',
  },
  owner: 'admin',
  result: {
    id: '1337',
    name: 'result name',
  },
  permissions: [{name: 'get_overrides'}],
  port: '66/tcp',
  severity: '5.0',
  newSeverity: '9.0',
  task: {
    id: '42',
    name: 'task x',
  },
  text: 'override text',
  userTags: {
    count: 1,
    tags: [
      {
        id: '123',
        name: 'override:unnamed',
        value: null,
        comment: null,
      },
    ],
  },
  writable: true,
});

export const inUseOverride = deepFreeze({
  id: '456',
  active: true,
  creationTime: '2020-12-23T14:14:11Z',
  endTime: '2021-12-23T14:14:11Z',
  hosts: ['127.0.0.1', '127.0.0.2'],
  inUse: true,
  modificationTime: '2021-01-04T11:54:12Z',
  nvt: {
    id: '123',
    name: 'foo nvt',
  },
  owner: 'admin',
  result: {
    id: '1337',
    name: 'result name',
  },
  permissions: [{name: 'Everything'}],
  port: '66/tcp',
  severity: '5.0',
  newSeverity: '9.0',
  task: {
    id: '42',
    name: 'task x',
  },
  text: 'override text',
  userTags: {
    count: 1,
    tags: [
      {
        id: '123',
        name: 'override:unnamed',
        value: null,
        comment: null,
      },
    ],
  },
  writable: true,
});

const listOverride = deepFreeze({
  id: '123',
  active: true,
  endTime: '2023-03-13T11:35:20Z',
  hosts: ['127.0.0.1', '127.0.0.2'],
  modificationTime: '2021-01-14T06:23:57Z',
  newSeverity: 5.0,
  nvt: {
    id: '12345',
    name: 'foo nvt',
  },
  result: null,
  permissions: [{name: 'Everything'}],
  port: '66/tcp',
  severity: 1.0,
  task: {
    id: '12345',
    name: 'task x',
  },
  text: 'override text',
});

const mockOverrides = {
  edges: [
    {
      node: listOverride,
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
    startCursor: 'override:0',
    endCursor: 'override:1',
    lastPageCursor: 'override:2',
  },
};

export const createGetOverridesQueryMock = (variables = {}) => {
  const queryResult = {
    data: {
      overrides: mockOverrides,
    },
  };

  const resultFunc = jest.fn().mockReturnValue(queryResult);

  const queryMock = {
    request: {
      query: GET_OVERRIDES,
      variables,
    },
    newData: resultFunc,
  };
  return [queryMock, resultFunc];
};

export const createOverrideInput = {
  id: '6d00d22f-551b-4fbe-8215-d8615eff73ea',
  active: true,
  creation_time: '2020-12-23T14:14:11Z',
  hosts: ['127.0.0.1'],
  in_use: false,
  modification_time: '2021-01-04T11:54:12Z',
  nvt: {
    id: '123',
    name: 'foo nvt',
    type: 'nvt',
  },
  owner: {name: 'admin'},
  permissions: {permission: {name: 'Everything'}},
  port: '66/tcp',
  text: 'override text',
  writable: true,
};

const createOverrideResult = {
  createOverride: {
    id: '6d00d22f-551b-4fbe-8215-d8615eff73ea',
    status: 200,
  },
};

export const createCreateOverrideQueryMock = () =>
  createGenericQueryMock(CREATE_OVERRIDE, createOverrideResult, {
    input: createOverrideInput,
  });

export const modifyOverrideInput = {
  id: '6d00d22f-551b-4fbe-8215-d8615eff73ea',
  text: 'Han shot first',
  hosts: '127.0.0.0',
};

const modifyOverrideResult = {
  modifyOverride: {
    ok: true,
  },
};

export const createModifyOverrideQueryMock = () =>
  createGenericQueryMock(MODIFY_OVERRIDE, modifyOverrideResult, {
    input: modifyOverrideInput,
  });

const bulkDeleteByIdsResult = {
  deleteOverridesByIds: {
    ok: true,
  },
};

export const createDeleteOverridesByIdsQueryMock = (overrideIds = ['456']) =>
  createGenericQueryMock(DELETE_OVERRIDES_BY_IDS, bulkDeleteByIdsResult, {
    ids: overrideIds,
  });

const bulkDeleteByFilterResult = {
  deleteOverridesByFilter: {
    ok: true,
  },
};

export const createDeleteOverridesByFilterQueryMock = (filterString = '456') =>
  createGenericQueryMock(DELETE_OVERRIDES_BY_FILTER, bulkDeleteByFilterResult, {
    filterString,
  });

const deleteOverrideResult = {
  deleteOverrideByIds: {
    ok: true,
    status: 200,
  },
};

export const createDeleteOverrideQueryMock = (overrideId = '456') =>
  createGenericQueryMock(DELETE_OVERRIDES_BY_IDS, deleteOverrideResult, {
    ids: [overrideId],
  });

export const createCloneOverrideQueryMock = (
  overrideId = '456',
  newOverrideId = '6d00d22f-551b-4fbe-8215-d8615eff73ea',
) =>
  createGenericQueryMock(
    CLONE_OVERRIDE,
    {
      cloneOverride: {
        id: newOverrideId,
      },
    },
    {id: overrideId},
  );

const exportOverridesByIdsResult = {
  exportOverridesByIds: {
    exportedEntities:
      '<get_overrides_response status="200" status_text="OK" />',
  },
};

export const createExportOverridesByIdsQueryMock = (ids = ['123']) =>
  createGenericQueryMock(EXPORT_OVERRIDES_BY_IDS, exportOverridesByIdsResult, {
    ids,
  });

const exportOverridesByFilterResult = {
  exportOverridesByFilter: {
    exportedEntities:
      '<get_overrides_response status="200" status_text="OK" />',
  },
};

export const createExportOverridesByFilterQueryMock = (
  filterString = 'foo',
) => {
  return createGenericQueryMock(
    EXPORT_OVERRIDES_BY_FILTER,
    exportOverridesByFilterResult,
    {filterString},
  );
};

export const createGetOverrideQueryMock = (
  overrideId = '456',
  override = detailsOverride,
) => {
  return createGenericQueryMock(
    GET_OVERRIDE,
    {override: detailsOverride},
    {id: overrideId},
  );
};

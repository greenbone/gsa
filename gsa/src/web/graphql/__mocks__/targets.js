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
import {createGenericQueryMock, deepFreeze} from 'web/utils/testing';

import {
  CLONE_TARGET,
  DELETE_TARGETS_BY_FILTER,
  DELETE_TARGETS_BY_IDS,
  EXPORT_TARGETS_BY_FILTER,
  EXPORT_TARGETS_BY_IDS,
  GET_TARGET,
  GET_TARGETS,
} from '../targets';

export const mockTarget = deepFreeze({
  id: '159',
  name: 'target 1',
  owner: 'admin',
  comment: 'detailspage',
  writable: true,
  inUse: false,
  creationTime: '2020-12-23T14:14:11+00:00',
  modificationTime: '2021-01-04T11:54:12+00:00',
  permissions: [{name: 'Everything'}],
  hosts: ['123.234.345.456', ' 127.0.0.1'],
  excludeHosts: ['192.168.0.1'],
  hostCount: 2,
  portList: {
    name: 'list',
    id: 'pl1',
  },
  sshCredential: {
    name: 'ssh',
    id: 'ssh1',
    port: 22,
  },
  smbCredential: {
    name: null,
    id: null,
  },
  esxiCredential: {
    name: null,
    id: null,
  },
  snmpCredential: {
    name: null,
    id: null,
  },
  tasks: [
    {
      name: 'task 1',
      id: 't1',
    },
  ],
  aliveTest: 'ICMP_PING',
  allowSimultaneousIPs: true,
  reverseLookupOnly: true,
  reverseLookupUnify: false,
  userTags: {
    count: 1,
    tags: [
      {
        id: '345',
        name: 'target:unnamed',
        value: null,
        comment: null,
      },
    ],
  },
});

export const inUseTarget = deepFreeze({
  id: '346',
  name: 'target 2',
  owner: 'admin',
  comment: 'asdfg',
  writable: true,
  inUse: true,
  creationTime: '2020-12-23T14:14:11+00:00',
  modificationTime: '2021-01-04T11:54:12+00:00',
  permissions: [{name: 'Everything'}],
  hosts: ['127.0.0.1'],
  excludeHosts: ['123.234.345.456', '192.168.0.1'],
  hostCount: 1,
  portList: {
    name: 'list',
    id: 'pl2',
  },
  sshCredential: {
    name: null,
    id: null,
  },
  smbCredential: {
    name: 'smb',
    id: 'smb2',
  },
  esxiCredential: {
    name: null,
    id: null,
  },
  snmpCredential: {
    name: null,
    id: null,
  },
  aliveTest: 'ICMP_PING',
  allowSimultaneousIPs: false,
  reverseLookupOnly: true,
  reverseLookupUnify: false,
  tasks: [
    {
      name: 'task 1',
      id: 't1',
    },
  ],
  userTags: {
    count: 1,
    tags: [
      {
        id: '345',
        name: 'target:unnamed',
        value: null,
        comment: null,
      },
    ],
  },
});

export const listTarget = deepFreeze({
  id: '159',
  name: 'target 1',
  owner: 'admin',
  comment: 'detailspage',
  writable: true,
  inUse: false,
  permissions: [{name: 'Everything'}],
  hosts: ['123.234.345.456', ' 127.0.0.1'],
  excludeHosts: ['192.168.0.1'],
  hostCount: 2,
  portList: {
    name: 'list',
    id: 'pl1',
  },
  sshCredential: {
    name: 'ssh',
    id: 'ssh1',
    port: 22,
  },
  smbCredential: {
    name: null,
    id: null,
  },
  esxiCredential: {
    name: null,
    id: null,
  },
  snmpCredential: {
    name: null,
    id: null,
  },
  aliveTest: 'ICMP_PING',
  allowSimultaneousIPs: true,
  reverseLookupOnly: true,
  reverseLookupUnify: false,
});

export const listTarget2 = deepFreeze({
  id: '343',
  name: 'target 2',
  owner: 'admin',
  comment: 'detailspage',
  writable: true,
  inUse: false,
  permissions: [{name: 'Everything'}],
  hosts: ['127.0.0.1'],
  excludeHosts: ['123.234.345.456', '192.168.0.1'],
  hostCount: 1,
  portList: {
    name: 'list',
    id: 'pl2',
  },
  sshCredential: {
    name: null,
    id: null,
    port: null,
  },
  smbCredential: {
    name: 'smb',
    id: 'smb2',
  },
  esxiCredential: {
    name: null,
    id: null,
  },
  snmpCredential: {
    name: null,
    id: null,
  },
  aliveTest: 'ICMP_PING',
  allowSimultaneousIPs: true,
  reverseLookupOnly: true,
  reverseLookupUnify: false,
});

const mockTargets = {
  edges: [
    {
      node: listTarget,
    },
    {
      node: listTarget2,
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
    startCursor: 'target:0',
    endCursor: 'target:1',
    lastPageCursor: 'target:3',
  },
};

export const noPermTarget = deepFreeze({
  id: '159',
  name: 'target 1',
  owner: 'admin',
  comment: 'detailspage',
  writable: true,
  inUse: false,
  creationTime: '2020-12-23T14:14:11+00:00',
  modificationTime: '2021-01-04T11:54:12+00:00',
  permissions: [{name: 'get_targets'}],
  hosts: ['123.234.345.456', ' 127.0.0.1'],
  excludeHosts: ['192.168.0.1'],
  hostCount: 2,
  portList: {
    name: 'list',
    id: 'pl1',
  },
  sshCredential: {
    name: 'ssh',
    id: 'ssh1',
    port: 22,
  },
  smbCredential: {
    name: null,
    id: null,
  },
  esxiCredential: {
    name: null,
    id: null,
  },
  snmpCredential: {
    name: null,
    id: null,
  },
  tasks: [
    {
      name: 'task 1',
      id: 't1',
    },
  ],
  aliveTest: 'ICMP_PING',
  allowSimultaneousIPs: true,
  reverseLookupOnly: true,
  reverseLookupUnify: false,
  userTags: {
    count: 1,
    tags: [
      {
        id: '345',
        name: 'target:unnamed',
        value: null,
        comment: null,
      },
    ],
  },
});

export const createGetTargetsQueryMock = (variables = {}) => {
  const queryResult = {
    data: {
      targets: mockTargets,
    },
  };

  const resultFunc = jest.fn().mockReturnValue(queryResult);

  const queryMock = {
    request: {
      query: GET_TARGETS,
      variables,
    },
    newData: resultFunc,
  };
  return [queryMock, resultFunc];
};

export const createGetTargetQueryMock = (
  targetId = '159',
  target = mockTarget,
) => createGenericQueryMock(GET_TARGET, {target}, {id: targetId});

const exportTargetsByIdsResult = {
  exportTargetsByIds: {
    exportedEntities: '<get_targets_response status="200" status_text="OK" />',
  },
};

export const createExportTargetsByIdsQueryMock = (ids = ['159']) =>
  createGenericQueryMock(EXPORT_TARGETS_BY_IDS, exportTargetsByIdsResult, {
    ids,
  });

const bulkDeleteByIdsResult = {
  deleteTargetsByIds: {
    ok: true,
  },
};

export const createDeleteTargetsByIdsQueryMock = (targetIds = ['159']) =>
  createGenericQueryMock(DELETE_TARGETS_BY_IDS, bulkDeleteByIdsResult, {
    ids: targetIds,
  });

export const createCloneTargetQueryMock = (
  targetId = '159',
  newTargetId = 'bar',
) =>
  createGenericQueryMock(
    CLONE_TARGET,
    {
      cloneTarget: {
        id: newTargetId,
      },
    },
    {id: targetId},
  );

const bulkDeleteByFilterResult = {
  deleteTargetsByFilter: {
    ok: true,
  },
};

export const createDeleteTargetsByFilterQueryMock = (filterString = 'foo') =>
  createGenericQueryMock(DELETE_TARGETS_BY_FILTER, bulkDeleteByFilterResult, {
    filterString,
  });

const exportTargetsByFilterResult = {
  exportTargetsByFilter: {
    exportedEntities: '<get_targets_response status="200" status_text="OK" />',
  },
};

export const createExportTargetsByFilterQueryMock = (filterString = 'foo') => {
  return createGenericQueryMock(
    EXPORT_TARGETS_BY_FILTER,
    exportTargetsByFilterResult,
    {filterString},
  );
};

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

import {GET_TARGET, GET_TARGETS} from '../targets';

const mockTarget = deepFreeze({
  id: '159',
  name: 'target 1',
  owner: 'admin',
  comment: 'detailspage',
  writable: true,
  inUse: false,
  creationTime: '2020-12-23T14:14:11+00:00',
  modificationTime: '2021-01-04T11:54:12+00:00',
  permissions: [{name: 'Everything'}],
  hosts: '123.234.345.456, 127.0.0.1',
  excludeHosts: '192.168.0.1',
  maxHosts: 2,
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
  aliveTests: 'Schroedingers host',
  allowSimultaneousIPs: true,
  reverseLookupOnly: true,
  reverseLookupUnify: false,
  portRange: '1-5',
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

const inUseTarget = deepFreeze({
  id: '346',
  name: 'target 2',
  owner: 'admin',
  comment: 'asdfg',
  writable: true,
  inUse: true,
  creationTime: '2020-12-23T14:14:11+00:00',
  modificationTime: '2021-01-04T11:54:12+00:00',
  permissions: [{name: 'Everything'}],
  hosts: '127.0.0.1',
  excludeHosts: '123.234.345.456, 192.168.0.1',
  maxHosts: 1,
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
  aliveTests: 'Schroedingers host',
  allowSimultaneousIPs: false,
  reverseLookupOnly: true,
  reverseLookupUnify: false,
  portRange: '1-5',
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

const mockTargets = {
  edges: [
    {
      node: mockTarget,
    },
    {
      node: inUseTarget,
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

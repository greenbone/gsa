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

import {deepFreeze} from 'web/utils/testing';

import {CREATE_CREDENTIAL, GET_CREDENTIALS} from '../credentials';

const credential1 = deepFreeze({
  id: '1',
  owner: 'admin',
  name: 'credential 1',
  comment: null,
  inUse: true,
  writable: true,
  creationTime: '2020-08-06T11:34:15+00:00',
  modificationTime: '2020-08-06T11:34:15+00:00',
  permissions: [{name: 'Everything'}],
  allowInsecure: true,
  login: 'admin',
  type: 'USERNAME_PASSWORD',
});

const credential2 = deepFreeze({
  id: '2',
  owner: 'admin',
  name: 'credential 2',
  comment: 'test',
  inUse: true,
  writable: false,
  creationTime: '2020-08-06T11:30:41+00:00',
  modificationTime: '2020-08-07T09:26:05+00:00',
  permissions: [{name: 'Everything'}],
  allowInsecure: false,
  login: 'admin',
  type: 'SNMP',
});

const mockCredentials = {
  nodes: [credential1, credential2],
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
    startCursor: 'credential:0',
    endCursor: 'credential:1',
    lastPageCursor: 'credential:3',
  },
};

export const createGetCredentialsQueryMock = (variables = {}) => {
  const queryResult = {
    data: {
      credentials: mockCredentials,
    },
  };

  const resultFunc = jest.fn().mockReturnValue(queryResult);

  const queryMock = {
    request: {
      query: GET_CREDENTIALS,
      variables,
    },
    newData: resultFunc,
  };

  return [queryMock, resultFunc];
};

export const createCreateCredentialQueryMock = (data, credentialId) => {
  const queryResult = {
    data: {
      createCredential: {
        id: credentialId,
      },
    },
  };

  const resultFunc = jest.fn().mockReturnValue(queryResult);

  const variables = {
    input: {
      ...data,
    },
  };

  const queryMock = {
    request: {
      query: CREATE_CREDENTIAL,
      variables,
    },
    newData: resultFunc,
  };
  return [queryMock, resultFunc];
};

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
  CLONE_POLICY,
  DELETE_POLICIES_BY_IDS,
  EXPORT_POLICIES_BY_IDS,
  GET_POLICY,
} from '../policies';

export const policy1 = deepFreeze({
  id: '234',
  name: 'unnamed policy',
  comment: 'some policy description',
  writable: true,
  owner: 'admin',
  inUse: false,
  creationTime: '2020-08-17T12:18:14+00:00',
  modificationTime: '2020-09-29T12:16:50+00:00',
  permissions: [{name: 'Everything'}],
  type: 0,
  trash: null,
  familyCount: 1,
  nvtCount: 345,
  usageType: 'audit',
  maxNvtCount: 345,
  knownNvtCount: 344,
  predefined: false,
  families: [
    {name: 'family1', growing: true, maxNvtCount: 10, nvtCount: 7},
    {name: 'family2', growing: false, maxNvtCount: 5, nvtCount: 0},
  ],
  preferences: [
    {
      alt: ['postgres', 'regress'],
      default: 'postgres',
      hrName: 'Postgres Username:',
      id: 1,
      name: 'Postgres Username:',
      type: 'entry',
      value: 'regress',
      nvt: {
        oid: '1.3.6.1.4.1.25623.1.0.100151',
        name: 'PostgreSQL Detection',
      },
    },
  ],
  nvtSelectors: [
    {
      name: '436',
      include: true,
      type: 2,
      familyOrNvt: '1.3.6.1.4.1.25623.1.0.100315',
    },
  ],
  tasks: [
    {
      name: 'foo',
      id: '457',
    },
  ],
});

export const policy2 = deepFreeze({
  id: '234',
  name: 'unnamed policy',
  comment: 'some policy description',
  writable: true,
  owner: 'admin',
  inUse: false,
  creationTime: '2020-08-17T12:18:14+00:00',
  modificationTime: '2020-09-29T12:16:50+00:00',
  permissions: [{name: 'get_config'}],
  type: 0,
  trash: null,
  familyCount: 1,
  nvtCount: 345,
  usageType: 'audit',
  maxNvtCount: 345,
  knownNvtCount: 344,
  predefined: false,
  families: [
    {name: 'family1', growing: true, maxNvtCount: 10, nvtCount: 7},
    {name: 'family2', growing: false, maxNvtCount: 5, nvtCount: 0},
  ],
  preferences: [
    {
      alt: ['postgres', 'regress'],
      default: 'postgres',
      hrName: 'Postgres Username:',
      id: 1,
      name: 'Postgres Username:',
      type: 'entry',
      value: 'regress',
      nvt: {
        oid: '1.3.6.1.4.1.25623.1.0.100151',
        name: 'PostgreSQL Detection',
      },
    },
  ],
  nvtSelectors: [
    {
      name: '436',
      include: true,
      type: 2,
      familyOrNvt: '1.3.6.1.4.1.25623.1.0.100315',
    },
  ],
  tasks: [
    {
      name: 'foo',
      id: '457',
    },
  ],
});

export const policy3 = deepFreeze({
  id: '234',
  name: 'unnamed policy',
  comment: 'some policy description',
  writable: true,
  owner: 'admin',
  inUse: true,
  creationTime: '2020-08-17T12:18:14+00:00',
  modificationTime: '2020-09-29T12:16:50+00:00',
  permissions: [{name: 'Everything'}],
  type: 0,
  trash: null,
  familyCount: 1,
  nvtCount: 345,
  usageType: 'audit',
  maxNvtCount: 345,
  knownNvtCount: 344,
  predefined: false,
  families: [
    {name: 'family1', growing: true, maxNvtCount: 10, nvtCount: 7},
    {name: 'family2', growing: false, maxNvtCount: 5, nvtCount: 0},
  ],
  preferences: [
    {
      alt: ['postgres', 'regress'],
      default: 'postgres',
      hrName: 'Postgres Username:',
      id: 1,
      name: 'Postgres Username:',
      type: 'entry',
      value: 'regress',
      nvt: {
        oid: '1.3.6.1.4.1.25623.1.0.100151',
        name: 'PostgreSQL Detection',
      },
    },
  ],
  nvtSelectors: [
    {
      name: '436',
      include: true,
      type: 2,
      familyOrNvt: '1.3.6.1.4.1.25623.1.0.100315',
    },
  ],
  tasks: [
    {
      name: 'foo',
      id: '457',
    },
  ],
});

export const policy4 = deepFreeze({
  id: '234',
  name: 'unnamed policy',
  comment: 'some policy description',
  writable: false,
  owner: 'admin',
  inUse: false,
  creationTime: '2020-08-17T12:18:14+00:00',
  modificationTime: '2020-09-29T12:16:50+00:00',
  permissions: [{name: 'Everything'}],
  type: 0,
  trash: null,
  familyCount: 1,
  nvtCount: 345,
  usageType: 'audit',
  maxNvtCount: 345,
  knownNvtCount: 344,
  predefined: false,
  families: [
    {name: 'family1', growing: true, maxNvtCount: 10, nvtCount: 7},
    {name: 'family2', growing: false, maxNvtCount: 5, nvtCount: 0},
  ],
  preferences: [
    {
      alt: ['postgres', 'regress'],
      default: 'postgres',
      hrName: 'Postgres Username:',
      id: 1,
      name: 'Postgres Username:',
      type: 'entry',
      value: 'regress',
      nvt: {
        oid: '1.3.6.1.4.1.25623.1.0.100151',
        name: 'PostgreSQL Detection',
      },
    },
  ],
  nvtSelectors: [
    {
      name: '436',
      include: true,
      type: 2,
      familyOrNvt: '1.3.6.1.4.1.25623.1.0.100315',
    },
  ],
  tasks: [
    {
      name: 'foo',
      id: '457',
    },
  ],
});

export const createGetPolicyQueryMock = (id = '234', result = policy1) =>
  createGenericQueryMock(GET_POLICY, {policy: result}, {id});

export const createClonePolicyQueryMock = (
  policyId = '234',
  newPolicyId = '345',
) =>
  createGenericQueryMock(
    CLONE_POLICY,
    {
      clonePolicy: {
        id: newPolicyId,
      },
    },
    {id: policyId},
  );

const exportPoliciesByIdsResult = {
  exportPoliciesByIds: {
    exportedEntities: '<get_configs_response status="200" status_text="OK" />',
  },
};

export const createExportPoliciesByIdsQueryMock = (policyIds = ['234']) =>
  createGenericQueryMock(EXPORT_POLICIES_BY_IDS, exportPoliciesByIdsResult, {
    ids: policyIds,
  });

const bulkDeleteByIdsResult = {
  deletePoliciesByIds: {
    ok: true,
  },
};

export const createDeletePoliciesByIdsQueryMock = (policyIds = ['234']) =>
  createGenericQueryMock(DELETE_POLICIES_BY_IDS, bulkDeleteByIdsResult, {
    ids: policyIds,
  });

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

import {
  deepFreeze,
  createGenericQueryMock,
  createGenericMutationResult,
} from 'web/utils/testing';

import {
  CLONE_SCAN_CONFIG,
  CREATE_SCAN_CONFIG,
  DELETE_SCAN_CONFIGS_BY_FILTER,
  DELETE_SCAN_CONFIGS_BY_IDS,
  EXPORT_SCAN_CONFIGS_BY_FILTER,
  EXPORT_SCAN_CONFIGS_BY_IDS,
  GET_SCAN_CONFIG,
  GET_SCAN_CONFIGS,
  IMPORT_SCAN_CONFIG,
  MODIFY_SCAN_CONFIG_SET_COMMENT,
  MODIFY_SCAN_CONFIG_SET_FAMILY_SELECTION,
  MODIFY_SCAN_CONFIG_SET_NAME,
  MODIFY_SCAN_CONFIG_SET_NVT_PREFERENCE,
  MODIFY_SCAN_CONFIG_SET_NVT_SELECTION,
  MODIFY_SCAN_CONFIG_SET_SCANNER_PREFERENCE,
} from '../scanconfigs';

export const nonWritableConfig = deepFreeze({
  id: '314',
  name: 'Half empty and slow',
  creationTime: '2020-08-17T12:18:14+00:00',
  comment: "Most NVT's",
  families: [
    {name: 'family1', growing: true, maxNvtCount: 10, nvtCount: 7},
    {name: 'family2', growing: false, maxNvtCount: 5, nvtCount: 0},
  ],
  familyCount: 1,
  familyGrowing: true,
  nvtGrowing: false,
  owner: 'admin',
  inUse: false,
  knownNvtCount: 99998,
  maxNvtCount: 99999,
  modificationTime: '2020-09-29T12:16:50+00:00',
  nvtCount: 99998,
  nvtSelectors: [
    {
      name: '436',
      include: true,
      type: 2,
      familyOrNvt: '1.3.6.1.4.1.25623.1.0.100315',
    },
  ],
  permissions: [{name: 'Everything'}],
  predefined: true,
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
  tasks: [
    {
      name: 'foo',
      id: '457',
    },
  ],
  trash: null,
  type: 0,
  usageType: 'scan',
  userTags: null,
  writable: false,
});

export const inUseConfig = deepFreeze({
  id: '314',
  name: 'Half empty and slow',
  creationTime: '2020-08-17T12:18:14+00:00',
  comment: "Most NVT's",
  families: [{name: 'addams', growing: true, maxNvtCount: 1, nvtCount: 1}],
  familyCount: 1,
  owner: 'admin',
  familyGrowing: true,
  nvtGrowing: false,
  inUse: true,
  knownNvtCount: 99998,
  maxNvtCount: 99999,
  modificationTime: '2020-09-29T12:16:50+00:00',
  nvtCount: 99998,
  nvtSelectors: [
    {
      name: '436',
      include: true,
      type: 2,
      familyOrNvt: '1.3.6.1.4.1.25623.1.0.100315',
    },
  ],
  permissions: [{name: 'Everything'}],
  predefined: false,
  preferences: [
    {
      alt: null,
      default: 'postgres',
      hrName: 'Postgres Username:',
      id: 1,
      name: 'Postgres Username:',
      type: 'entry',
      value: 'postgres',
      nvt: {
        oid: '1.3.6.1.4.1.25623.1.0.100151',
        name: 'PostgreSQL Detection',
      },
    },
  ],
  tasks: [
    {
      name: 'foo',
      id: '457',
    },
  ],
  trash: null,
  type: 0,
  usageType: 'scan',
  userTags: null,
  writable: true,
});

export const editableConfig = deepFreeze({
  id: '314',
  name: 'Half empty and slow',
  creationTime: '2020-08-17T12:18:14+00:00',
  comment: "Most NVT's",
  families: [{name: 'addams', growing: true, maxNvtCount: 1, nvtCount: 1}],
  familyCount: 1,
  owner: 'admin',
  inUse: false,
  familyGrowing: true,
  nvtGrowing: false,
  knownNvtCount: 99998,
  maxNvtCount: 99999,
  modificationTime: '2020-09-29T12:16:50+00:00',
  nvtCount: 99998,
  nvtSelectors: [
    {
      name: '436',
      include: true,
      type: 2,
      familyOrNvt: '1.3.6.1.4.1.25623.1.0.100315',
    },
  ],
  permissions: [{name: 'Everything'}],
  predefined: false,
  preferences: [
    {
      alt: null,
      default: 'postgres',
      hrName: 'Postgres Username:',
      id: 1,
      name: 'Postgres Username:',
      type: 'entry',
      value: 'postgres',
      nvt: {
        oid: '1.3.6.1.4.1.25623.1.0.100151',
        name: 'PostgreSQL Detection',
      },
    },
  ],
  tasks: [
    {
      name: 'foo',
      id: '457',
    },
  ],
  trash: null,
  type: 0,
  usageType: 'scan',
  userTags: null,
  writable: true,
});

export const noPermConfig = deepFreeze({
  id: '314',
  name: 'Half empty and slow',
  creationTime: '2020-08-17T12:18:14+00:00',
  comment: "Most NVT's",
  families: [{name: 'addams', growing: true, maxNvtCount: 1, nvtCount: 1}],
  familyCount: 1,
  owner: 'admin',
  inUse: false,
  familyGrowing: true,
  nvtGrowing: false,
  knownNvtCount: 99998,
  maxNvtCount: 99999,
  modificationTime: '2020-09-29T12:16:50+00:00',
  nvtCount: 99998,
  nvtSelectors: [
    {
      name: '436',
      include: true,
      type: 2,
      familyOrNvt: '1.3.6.1.4.1.25623.1.0.100315',
    },
  ],
  permissions: null,
  predefined: false,
  preferences: [
    {
      alt: null,
      default: 'postgres',
      hrName: 'Postgres Username:',
      id: 1,
      name: 'Postgres Username:',
      type: 'entry',
      value: 'postgres',
      nvt: {
        oid: '1.3.6.1.4.1.25623.1.0.100151',
        name: 'PostgreSQL Detection',
      },
    },
  ],
  tasks: [
    {
      name: 'foo',
      id: '457',
    },
  ],
  trash: null,
  type: 0,
  usageType: 'scan',
  userTags: null,
  writable: true,
});

const mockScanConfigs = {
  edges: [
    {
      node: nonWritableConfig,
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

export const createGetScanConfigQueryMock = (
  id = '314',
  result = nonWritableConfig,
) => createGenericQueryMock(GET_SCAN_CONFIG, {scanConfig: result}, {id});

export const createGetScanConfigsQueryMock = (variables = {}) =>
  createGenericQueryMock(
    GET_SCAN_CONFIGS,
    {scanConfigs: mockScanConfigs},
    variables,
  );

export const createScanConfigInput = {
  configId: 'foo',
  name: 'bar',
  comment: 'lorem',
};

const createScanConfigResult = {
  createScanConfig: {
    id: '12345',
    status: 200,
  },
};

export const createCreateScanConfigQueryMock = () =>
  createGenericQueryMock(CREATE_SCAN_CONFIG, createScanConfigResult, {
    input: createScanConfigInput,
  });

export const importScanConfigInput = {
  config: '<get_configs_response />',
};

export const importScanConfigResult = {
  importScanConfig: {
    id: '13245',
  },
};

export const createImportScanConfigQueryMock = () =>
  createGenericQueryMock(
    IMPORT_SCAN_CONFIG,
    importScanConfigResult,
    importScanConfigInput,
  );

export const createCloneScanConfigQueryMock = (
  configId = '314',
  newConfigId = '354',
) =>
  createGenericQueryMock(
    CLONE_SCAN_CONFIG,
    {
      cloneScanConfig: {
        id: newConfigId,
      },
    },
    {id: configId},
  );

const exportScanConfigsByIdsResult = {
  exportScanConfigsByIds: {
    exportedEntities: '<get_configs_response status="200" status_text="OK" />',
  },
};

export const createExportScanConfigsByIdsQueryMock = (
  scanConfigIds = ['314'],
) =>
  createGenericQueryMock(
    EXPORT_SCAN_CONFIGS_BY_IDS,
    exportScanConfigsByIdsResult,
    {ids: scanConfigIds},
  );

const bulkDeleteByIdsResult = {
  deleteScanConfigsByIds: {
    ok: true,
  },
};

export const createDeleteScanConfigsByIdsQueryMock = (
  scanConfigIds = ['314'],
) =>
  createGenericQueryMock(DELETE_SCAN_CONFIGS_BY_IDS, bulkDeleteByIdsResult, {
    ids: scanConfigIds,
  });

const bulkDeleteByFilterResult = {
  deleteScanConfigsByFilter: {
    ok: true,
  },
};

export const createDeleteScanConfigsByFilterQueryMock = (
  filterString = 'foo',
) =>
  createGenericQueryMock(
    DELETE_SCAN_CONFIGS_BY_FILTER,
    bulkDeleteByFilterResult,
    {filterString},
  );

const exportScanConfigsByFilterResult = {
  exportScanConfigsByFilter: {
    exportedEntities: '<get_configs_response status="200" status_text="OK" />',
  },
};

export const createExportScanConfigsByFilterQueryMock = (
  filterString = 'foo',
) =>
  createGenericQueryMock(
    EXPORT_SCAN_CONFIGS_BY_FILTER,
    exportScanConfigsByFilterResult,
    {filterString},
  );

const modifyScanConfigSetNameInput = {
  id: '314',
  name: 'very fast',
};

export const createModifyScanConfigSetNameQueryMock = errors =>
  createGenericQueryMock(
    MODIFY_SCAN_CONFIG_SET_NAME,
    createGenericMutationResult('modifyScanConfigSetName'),
    {input: modifyScanConfigSetNameInput},
    errors,
  );

const modifyScanConfigSetCommentInput = {
  id: '314',
  comment: 'foo',
};

export const createModifyScanConfigSetCommentQueryMock = errors =>
  createGenericQueryMock(
    MODIFY_SCAN_CONFIG_SET_COMMENT,
    createGenericMutationResult('modifyScanConfigSetComment'),
    {input: modifyScanConfigSetCommentInput},
    errors,
  );

const modifyScanConfigSetScannerPreferenceInput = {
  id: '314',
  name: 'scanner:scanner:scanner:nomushrooms',
  value: 'absolutelynot',
};

export const createModifyScanConfigSetScannerPreferenceQueryMock = errors =>
  createGenericQueryMock(
    MODIFY_SCAN_CONFIG_SET_SCANNER_PREFERENCE,
    createGenericMutationResult('modifyScanConfigSetScannerPreference'),
    {input: modifyScanConfigSetScannerPreferenceInput},
    errors,
  );

const modifyScanConfigSetFamilySelectionInput = {
  id: '314',
  families: [{name: 'hello', growing: 0, all: 1}],
};

export const createModifyScanConfigSetFamilySelectionQueryMock = errors =>
  createGenericQueryMock(
    MODIFY_SCAN_CONFIG_SET_FAMILY_SELECTION,
    createGenericMutationResult('modifyScanConfigSetFamilySelection'),
    {input: modifyScanConfigSetFamilySelectionInput},
    errors,
  );

export const modifyScanConfigSetNvtPreferenceInput = {
  id: '314',
  nvtOid: '1.2.3.4',
  name: '1.2.3.4:1:entry:username:',
  value: 'admin',
};

export const createModifyScanConfigSetNvtPreferenceQueryMock = errors =>
  createGenericQueryMock(
    MODIFY_SCAN_CONFIG_SET_NVT_PREFERENCE,
    createGenericMutationResult('modifyScanConfigSetNvtPreference'),
    {input: modifyScanConfigSetNvtPreferenceInput},
    errors,
  );

const modifyScanConfigSetNvtSelectionInput = {
  id: '314',
  family: 'a bunch of nvts',
  nvtOids: ['foo'],
};

export const createModifyScanConfigSetNvtSelectionQueryMock = errors =>
  createGenericQueryMock(
    MODIFY_SCAN_CONFIG_SET_NVT_SELECTION,
    createGenericMutationResult('modifyScanConfigSetNvtSelection'),
    {input: modifyScanConfigSetNvtSelectionInput},
    errors,
  );

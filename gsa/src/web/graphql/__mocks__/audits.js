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

import {AUDIT_STATUS} from 'gmp/models/audit';
import {OPENVAS_SCAN_CONFIG_TYPE} from 'gmp/models/scanconfig';
import {
  createGenericQueryMock,
  createGenericMutationResult,
  deepFreeze,
} from 'web/utils/testing';
import {
  CLONE_AUDIT,
  CREATE_AUDIT,
  DELETE_AUDITS_BY_IDS,
  EXPORT_AUDITS_BY_IDS,
  GET_AUDIT,
  MODIFY_AUDIT,
  RESUME_AUDIT,
  START_AUDIT,
  STOP_AUDIT,
} from '../audits';

const alert = deepFreeze({id: '151617', name: 'alert 1'});

const target = deepFreeze({
  id: '159',
  name: 'target 1',
});

const auditDetailsTarget = deepFreeze({
  id: '5678',
  name: 'target1',
});

// Scanner
const scanner = deepFreeze({
  id: '212223',
  name: 'scanner 1',
  type: 'OPENVAS_SCANNER_TYPE',
});

const auditDetailsScanner = deepFreeze({
  id: '1516',
  name: 'scanner1',
  type: 'OPENVAS_SCANNER_TYPE',
});

// Policy
export const policy = deepFreeze({
  id: '234',
  name: 'unnamed policy',
  type: OPENVAS_SCAN_CONFIG_TYPE,
  trash: null,
});

export const auditDetailsPolicy = deepFreeze({
  id: '314',
  name: 'foo',
  comment: 'bar',
  writable: null,
  owner: null,
  inUse: null,
  creationTime: null,
  modificationTime: null,
  permissions: null,
  type: OPENVAS_SCAN_CONFIG_TYPE,
  trash: null,
  familyCount: null,
  familyGrowing: null,
  nvtGrowing: null,
  nvtCount: null,
  usageType: null,
  maxNvtCount: null,
  knownNvtCount: null,
  predefined: null,
  families: null,
  preferences: null,
  nvtSelectors: null,
  tasks: [
    {id: '12345', name: 'foo'},
    {id: '678910', name: 'audit2'},
  ],
});

// Reports
const lastReport = deepFreeze({
  id: '1234',
  severity: '5.0',
  timestamp: '2019-07-30T13:23:30Z',
  scanStart: '2019-07-30T13:23:34Z',
  scanEnd: '2019-07-30T13:25:43Z',
  complianceCount: {
    yes: 3,
    no: 2,
    incomplete: 4,
  },
});

const auditDetailsLastReport = deepFreeze({
  id: '1234',
  timestamp: '2019-07-30T13:23:30Z',
  scanStart: '2019-07-30T13:23:34Z',
  scanEnd: '2019-07-30T13:25:43Z',
  severity: null,
  complianceCount: {yes: 4, no: 3, incomplete: 1},
});

const currentReport = deepFreeze({
  id: '5678',
  timestamp: '2019-08-30T13:23:30Z',
  scanStart: '2019-08-30T13:23:34Z',
});

const weekly = `
BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Greenbone.net//NONSGML Greenbone Security Manager
 20.8+alpha~git-b4610ada-master//EN
BEGIN:VEVENT
DTSTART:20200615T080000Z
DURATION:PT0S
RRULE:FREQ=WEEKLY
UID:c5694e2e-daea-419b-b524-bb363b4ca37b
DTSTAMP:20200615T072702Z
END:VEVENT
END:VCALENDAR
`;

// Schedule
const schedule = deepFreeze({
  id: 'foo',
  name: 'schedule 1',
  timezone: 'UTC',
  duration: 0,
  icalendar: weekly,
});

export const auditDetailsSchedule = deepFreeze({
  id: '121314',
  name: 'schedule1',
  icalendar: null,
  timezone: null,
  userTags: null,
  permissions: null,
  owner: null,
  comment: null,
  writable: null,
  inUse: false,
  creationTime: null,
  modificationTime: null,
});

const allPermissions = deepFreeze([
  {
    name: 'Everything',
  },
]);

// Observers
const observers = deepFreeze({
  users: ['john', 'jane'],
  roles: [
    {
      name: 'admin role',
    },
    {
      name: 'user role',
    },
  ],
  groups: [
    {
      name: 'group 1',
    },
    {
      name: 'group 2',
    },
  ],
});

// Preferences
const preferences = deepFreeze([
  {
    description: 'Add results to Asset Management',
    name: 'in_assets',
    value: 'yes',
  },
  {
    description: 'Apply Overrides when adding Assets',
    name: 'assets_apply_overrides',
    value: 'yes',
  },
  {
    description: 'Min QOD when adding Assets',
    name: 'assets_min_qod',
    value: '70',
  },
  {
    description: 'Auto Delete Reports',
    name: 'auto_delete',
    value: 'no',
  },
  {
    description: 'Auto Delete Reports Data',
    name: 'auto_delete_data',
    value: '5',
  },
  {
    description: 'Maximum concurrently executed NVTs per host',
    name: 'max_checks',
    value: '4',
  },
  {
    description: 'Maximum concurrently scanned hosts',
    name: 'max_hosts',
    value: '20',
  },
]);

const auditDetailsPreferences = deepFreeze([
  {
    name: 'Add results to Asset Management',
    scanner_name: 'in_assets',
    value: 'yes',
  },
  {
    name: 'Auto Delete Reports',
    scanner_name: 'auto_delete',
    value: 'no',
  },
]);

export const auditDetailsAudit = deepFreeze({
  name: 'foo',
  id: '12345',
  creationTime: null,
  modificationTime: null,
  averageDuration: null,
  permissions: [{name: 'Everything'}],
  reports: {
    lastReport: auditDetailsLastReport,
    currentReport: null,
    counts: {
      total: 1,
      finished: 1,
    },
  },
  results: null,
  status: AUDIT_STATUS.done,
  progress: null,
  target: auditDetailsTarget,
  trend: null,
  alterable: 0,
  comment: 'bar',
  owner: 'username',
  preferences: auditDetailsPreferences,
  schedule: auditDetailsSchedule,
  alerts: [{id: '91011', name: 'alert1'}],
  policy: auditDetailsPolicy,
  scanner: auditDetailsScanner,
  schedulePeriods: null,
  hostsOrdering: null,
  observers: null,
});

export const detailsMockAudit = deepFreeze({
  name: 'foo',
  id: '657',
  creationTime: '2019-07-30T13:00:00Z',
  modificationTime: '2019-08-30T13:23:30Z',
  averageDuration: 3,
  permissions: allPermissions,
  reports: {
    lastReport,
    currentReport,
    counts: {
      total: 1,
      finished: 1,
    },
  },
  results: {
    counts: {
      current: 20,
    },
  },
  status: AUDIT_STATUS.done,
  progress: 100,
  target,
  trend: null,
  alterable: 0,
  comment: 'bar',
  owner: 'admin',
  preferences,
  schedule,
  alerts: [alert],
  policy,
  scanner,
  schedulePeriods: null,
  hostsOrdering: 'sequential',
  observers,
});

export const createAuditInput = {
  name: 'a1',
  comment: 'bar',
  policyId: 'p1',
  scannerId: 's1',
  targetId: 't1',
};

const createAuditResult = {
  createAlert: {
    id: '657',
    status: 200,
  },
};

export const createCreateAuditQueryMock = () =>
  createGenericQueryMock(CREATE_AUDIT, createAuditResult, {
    input: createAuditInput,
  });

export const modifyAuditInput = {
  id: '657',
  name: 'a1',
  comment: 'bar',
  policyId: 'p1',
  scannerId: 's1',
  targetId: 't1',
};

const modifyAuditResult = {
  modifyAudit: {
    ok: true,
  },
};

export const createModifyAuditQueryMock = () =>
  createGenericQueryMock(MODIFY_AUDIT, modifyAuditResult, {
    input: modifyAuditInput,
  });

const stopAuditResult = createGenericMutationResult('stopAudit');

export const createStopAuditQueryMock = auditId =>
  createGenericQueryMock(STOP_AUDIT, stopAuditResult, {id: auditId});

const resumeAuditResult = createGenericMutationResult('resumeAudit');

export const createResumeAuditQueryMock = auditId =>
  createGenericQueryMock(RESUME_AUDIT, resumeAuditResult, {id: auditId});

export const createStartAuditQueryMock = (auditId, reportId) => {
  const startAuditResult = {
    startAudit: {
      reportId,
    },
  };

  return createGenericQueryMock(START_AUDIT, startAuditResult, {id: auditId});
};

export const createCloneAuditQueryMock = (
  auditId = '657',
  newAuditId = '567',
) =>
  createGenericQueryMock(
    CLONE_AUDIT,
    {
      cloneAudit: {
        id: newAuditId,
      },
    },
    {id: auditId},
  );

const deleteAuditResult = createGenericMutationResult('audit');

export const createDeleteAuditQueryMock = (auditId = '657') =>
  createGenericQueryMock(DELETE_AUDITS_BY_IDS, deleteAuditResult, {
    ids: [auditId],
  });

const exportAuditsByIdsResult = {
  exportAuditsByIds: {
    exportedEntities: '<get_tasks_response status="200" status_text="OK" />',
  },
};

export const createExportAuditsByIdsQueryMock = (ids = ['657']) =>
  createGenericQueryMock(EXPORT_AUDITS_BY_IDS, exportAuditsByIdsResult, {
    ids,
  });

export const createGetAuditQueryMock = (
  auditId = '657',
  audit = detailsMockAudit,
) => createGenericQueryMock(GET_AUDIT, {audit}, {id: auditId});

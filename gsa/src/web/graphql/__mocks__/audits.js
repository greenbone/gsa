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

import {
  createGenericQueryMock,
  createGenericMutationResult,
} from 'web/utils/testing';
import {
  CREATE_AUDIT,
  MODIFY_AUDIT,
  RESUME_AUDIT,
  START_AUDIT,
  STOP_AUDIT,
} from '../audits';

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

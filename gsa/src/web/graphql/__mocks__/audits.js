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

import {createGenericQueryMock} from 'web/utils/testing';
import {CREATE_AUDIT, MODIFY_AUDIT} from '../audits';

const createAuditInput = {
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

const modifyAuditInput = {
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

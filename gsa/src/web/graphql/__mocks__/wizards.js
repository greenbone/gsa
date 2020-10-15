/* Copyright (C) 2020 Greenbone Networks GmbH
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

import {ALL_IANA_ASSIGNED_TCP} from 'gmp/models/portlist';
import {FULL_AND_FAST_SCAN_CONFIG_ID} from 'gmp/models/scanconfig';
import {OPENVAS_DEFAULT_SCANNER_ID} from 'gmp/models/scanner';

import {CREATE_TARGET} from 'web/graphql/targets';

import {CREATE_TASK, START_TASK} from 'web/graphql/tasks';
import {createGenericQueryMock} from 'web/utils/testing';

export const createTargetInput = {
  name:
    'Target for immediate scan of IP 127.0.0.1, 192.168.0.1 - Wed, Oct 14, 2020 12:00 AM ',
  hosts: '127.0.0.1, 192.168.0.1',
  portListId: ALL_IANA_ASSIGNED_TCP,
};

const createTargetResult = {
  createTarget: {
    id: '13579',
    status: 200,
  },
};

export const createTaskInput = {
  name: 'Immediate scan of IP 127.0.0.1, 192.168.0.1',
  configId: FULL_AND_FAST_SCAN_CONFIG_ID,
  targetId: '13579',
  scannerId: OPENVAS_DEFAULT_SCANNER_ID,
};

const createTaskResult = {
  createTask: {
    id: '24680',
    status: 200,
  },
};

export const startTaskInput = {id: '24680'};

export const startTaskResult = {
  startTask: {
    reportId: '13245',
  },
};

export const createWizardTargetQueryMock = errors =>
  createGenericQueryMock(
    CREATE_TARGET,
    createTargetResult,
    {
      input: createTargetInput,
    },
    errors,
  );

export const createWizardTaskQueryMock = errors =>
  createGenericQueryMock(
    CREATE_TASK,
    createTaskResult,
    {input: createTaskInput},
    errors,
  );

export const createWizardStartTaskQueryMock = errors =>
  createGenericQueryMock(START_TASK, startTaskResult, startTaskInput, errors);

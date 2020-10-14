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

import {CREATE_TARGET} from 'web/graphql/targets';

import {CREATE_TASK, START_TASK} from 'web/graphql/tasks';
import {createGenericQueryMock} from 'web/utils/testing';

export const createTargetInput = {
  name:
    'Target for immediate scan of IP 127.0.0.1, 192.168.0.1 - Wed, Oct 14, 2020 12:00 AM ',
  hosts: '127.0.0.1, 192.168.0.1',
  portListId: '33d0cd82-57c6-11e1-8ed1-406186ea4fc5',
};

const createTargetResult = {
  createTarget: {
    id: '13579',
    status: 200,
  },
};

export const createTaskInput = {
  name: 'Immediate scan of IP 127.0.0.1, 192.168.0.1',
  configId: 'daba56c8-73ec-11df-a475-002264764cea',
  targetId: '13579',
  scannerId: '08b69003-5fc2-4037-a479-93b440211c73',
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

export const createWizardTargetQueryMock = () =>
  createGenericQueryMock(CREATE_TARGET, createTargetResult, {
    input: createTargetInput,
  });

export const createWizardTaskQueryMock = () =>
  createGenericQueryMock(CREATE_TASK, createTaskResult, {
    input: createTaskInput,
  });

export const createWizardStartTaskQueryMock = () =>
  createGenericQueryMock(START_TASK, startTaskResult, startTaskInput);

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

import {deepFreeze, createGenericQueryMock} from 'web/utils/testing';

import {GET_ALERTS, CREATE_ALERT, MODIFY_ALERT} from '../alerts';

const alert1 = deepFreeze({
  id: '1',
  name: 'alert 1',
  inUse: true,
  writable: true,
  active: true,
  creationTime: '2020-08-06T11:34:15+00:00',
  modificationTime: '2020-08-06T11:34:15+00:00',
  owner: 'admin',
  method: {
    type: 'Alemba vFire',
    data: [
      {name: 'report_formats', value: 'c1645568-627a-11e3-a660-406186ea4fc5'},
      {name: 'vfire_base_url', value: '127.0.0.1'},
      {name: 'vfire_call_type_name', value: 'foo'},
      {name: 'delta_type', value: 'None'},
      {name: 'vfire_client_id', value: 'clientID'},
      {name: 'vfire_call_partition_name', value: 'lorem'},
      {name: 'delta_report_id', value: null},
      {name: 'vfire_call_template_name', value: 'bar'},
      {name: 'vfire_call_urgency_name', value: 'hello'},
      {name: 'vfire_call_impact_name', value: 'baz'},
      {name: 'details_url', value: 'https://secinfo.greenbone.net/etc'},
    ],
  },
  event: {
    type: 'Task run status changed',
    data: [{name: 'status', value: 'Done'}],
  },
  condition: {
    type: 'Always',
    data: [],
  },
  permissions: [{name: 'Everything'}],
  tasks: [
    {id: '8589296f-5051-4ed9-9d86-c022936e2893', name: 'task_with_alerts'},
    {id: '173a38fe-1038-48a6-9c48-a623ffc04ba8', name: 'scan_local'},
  ],
});

const alert2 = deepFreeze({
  id: '2',
  name: 'alert 2',
  inUse: true,
  writable: false,
  active: true,
  creationTime: '2020-08-06T11:30:41+00:00',
  modificationTime: '2020-08-07T09:26:05+00:00',
  owner: 'admin',
  method: {
    type: 'Email',
    data: [
      {name: 'notice', value: '1'},
      {name: 'from_address', value: 'foo@bar.com'},
      {name: 'delta_type', value: 'None'},
      {name: 'to_address', value: 'foo@bar.com'},
      {name: 'delta_report_id', value: null},
      {name: 'subject', value: '[GVM] $T $q $S since $d'},
      {name: 'details_url', value: 'https://secinfo.greenbone.net/etc'},
    ],
  },
  event: {
    type: 'Updated SecInfo arrived',
    data: [{name: 'secinfo_type', value: 'nvt'}],
  },
  condition: {
    type: 'Filter count at least',
    data: [{name: 'count', value: '3'}],
  },
  permissions: [{name: 'Everything'}],
  tasks: null,
});

const mockAlerts = {
  edges: [
    {
      node: alert1,
    },
    {
      node: alert2,
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
    startCursor: 'YWxlcnQ6MA==',
    endCursor: 'YWxlcnQ6OQ==',
    lastPageCursor: 'YWxlcnQ6MA==',
  },
};

export const createGetAlertsQueryMock = () =>
  createGenericQueryMock(GET_ALERTS, {alerts: mockAlerts});

const createAlertResult = {
  createAlert: {
    id: '12345',
    status: 200,
  },
};

export const createAlertInput = {
  name: 'foo',
  event: 'NEW_SECINFO_ARRIVED',
  condition: 'ALWAYS',
  method: 'HTTP_GET',
  methodData: {
    URL: 'yourdomain.com',
    composer_include_notes: 1,
    composer_include_overrides: 0,
    delta_report_id: '23456',
    delta_type: 'PREVIOUS',
    details_url: 'https://secinfo.greenbone.net/etc',
  },
};

export const createCreateAlertQueryMock = () =>
  createGenericQueryMock(CREATE_ALERT, createAlertResult, {
    input: createAlertInput,
  });

const modifyAlertResult = {
  modifyAlert: {
    ok: true,
    status: 200,
  },
};

export const modifyAlertInput = {
  id: '12345',
  name: 'foo',
  event: 'NEW_SECINFO_ARRIVED',
  condition: 'ALWAYS',
  method: 'HTTP_GET',
  methodData: {
    URL: 'yourdomain.com',
    composer_include_notes: 1,
    composer_include_overrides: 0,
    delta_report_id: '23456',
    delta_type: 'PREVIOUS',
    details_url: 'https://secinfo.greenbone.net/etc',
  },
};

export const createModifyAlertQueryMock = () =>
  createGenericQueryMock(MODIFY_ALERT, modifyAlertResult, {
    input: modifyAlertInput,
  });

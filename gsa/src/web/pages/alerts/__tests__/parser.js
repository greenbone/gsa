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

import {
  CONDITION_TYPE_ALWAYS,
  CONDITION_TYPE_FILTER_COUNT_AT_LEAST,
  CONDITION_TYPE_FILTER_COUNT_CHANGED,
  CONDITION_TYPE_SEVERITY_AT_LEAST,
  EVENT_TYPE_UPDATED_SECINFO,
  EVENT_TYPE_NEW_SECINFO,
  EVENT_TYPE_TASK_RUN_STATUS_CHANGED,
  EVENT_TYPE_TICKET_RECEIVED,
  EVENT_TYPE_ASSIGNED_TICKET_CHANGED,
  EVENT_TYPE_OWNED_TICKET_CHANGED,
  METHOD_TYPE_ALEMBA_VFIRE,
  METHOD_TYPE_SCP,
  METHOD_TYPE_SEND,
  METHOD_TYPE_SMB,
  METHOD_TYPE_SNMP,
  METHOD_TYPE_SYSLOG,
  METHOD_TYPE_EMAIL,
  METHOD_TYPE_START_TASK,
  METHOD_TYPE_HTTP_GET,
  METHOD_TYPE_SOURCEFIRE,
  METHOD_TYPE_VERINICE,
  METHOD_TYPE_TIPPING_POINT,
} from 'gmp/models/alert';

import {
  convertConditionEnum,
  convertDict,
  convertMethodEnum,
  convertEventEnum,
  convertSecInfoEnum,
  convertDirectionEnum,
  convertFeedEventEnum,
  convertTaskStatusEnum,
  convertDeltaTypeEnum,
} from '../parser';

describe('Enum conversion tests', () => {
  test('convertConditionEnum tests', () => {
    expect(convertConditionEnum(CONDITION_TYPE_ALWAYS)).toEqual('ALWAYS');
    expect(convertConditionEnum(CONDITION_TYPE_FILTER_COUNT_AT_LEAST)).toEqual(
      'FILTER_COUNT_AT_LEAST',
    );
    expect(convertConditionEnum(CONDITION_TYPE_FILTER_COUNT_CHANGED)).toEqual(
      'FILTER_COUNT_CHANGED',
    );
    expect(convertConditionEnum(CONDITION_TYPE_SEVERITY_AT_LEAST)).toEqual(
      'SEVERITY_AT_LEAST',
    );
    expect(convertConditionEnum('foobar')).toEqual(null);
    expect(convertConditionEnum()).toEqual(null);
  });
  test('convertEventEnum tests', () => {
    expect(convertEventEnum(EVENT_TYPE_TASK_RUN_STATUS_CHANGED)).toEqual(
      'TASK_RUN_STATUS_CHANGED',
    );
    expect(convertEventEnum(EVENT_TYPE_UPDATED_SECINFO)).toEqual(
      'UPDATED_SECINFO_ARRIVED',
    );
    expect(convertEventEnum(EVENT_TYPE_NEW_SECINFO)).toEqual(
      'NEW_SECINFO_ARRIVED',
    );
    expect(convertEventEnum(EVENT_TYPE_TICKET_RECEIVED)).toEqual(null);
    expect(convertEventEnum(EVENT_TYPE_ASSIGNED_TICKET_CHANGED)).toEqual(null);
    expect(convertEventEnum(EVENT_TYPE_OWNED_TICKET_CHANGED)).toEqual(null);
    expect(convertEventEnum('foobar')).toEqual(null);
    expect(convertEventEnum()).toEqual(null);
  });
  test('convertMethodEnum tests', () => {
    expect(convertMethodEnum(METHOD_TYPE_SCP)).toEqual('SCP');
    expect(convertMethodEnum(METHOD_TYPE_SEND)).toEqual('SEND');
    expect(convertMethodEnum(METHOD_TYPE_SMB)).toEqual('SMB');
    expect(convertMethodEnum(METHOD_TYPE_SNMP)).toEqual('SNMP');
    expect(convertMethodEnum(METHOD_TYPE_SYSLOG)).toEqual('SYSLOG');
    expect(convertMethodEnum(METHOD_TYPE_EMAIL)).toEqual('EMAIL');
    expect(convertMethodEnum(METHOD_TYPE_START_TASK)).toEqual('START_TASK');
    expect(convertMethodEnum(METHOD_TYPE_HTTP_GET)).toEqual('HTTP_GET');
    expect(convertMethodEnum(METHOD_TYPE_SOURCEFIRE)).toEqual(
      'SOURCEFIRE_CONNECTOR',
    );
    expect(convertMethodEnum(METHOD_TYPE_VERINICE)).toEqual(
      'VERINICE_CONNECTOR',
    );
    expect(convertMethodEnum(METHOD_TYPE_TIPPING_POINT)).toEqual(null);
    expect(convertMethodEnum(METHOD_TYPE_ALEMBA_VFIRE)).toEqual(null);

    expect(convertMethodEnum('foobar')).toEqual(null);
    expect(convertMethodEnum()).toEqual(null);
  });
});

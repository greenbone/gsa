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
  CONDITION_TYPE_ALWAYS,
  CONDITION_TYPE_FILTER_COUNT_AT_LEAST,
  CONDITION_TYPE_FILTER_COUNT_CHANGED,
  CONDITION_TYPE_SEVERITY_AT_LEAST,
  CONDITION_TYPE_SEVERITY_CHANGED,
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
  fileToBase64,
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
import {
  method_data_fields,
  event_data_fields,
  condition_data_fields,
} from 'gmp/commands/alerts';

describe('Enum conversion tests', () => {
  test('convertSecInfoEnum', () => {
    expect(convertSecInfoEnum('nvt')).toEqual('NVT');
    expect(convertSecInfoEnum('cve')).toEqual('CVE');
    expect(convertSecInfoEnum('cpe')).toEqual('CPE');
    expect(convertSecInfoEnum('cert_bund_adv')).toEqual('CERT_BUND_ADV');
    expect(convertSecInfoEnum('dfn_cert_adv')).toEqual('DFN_CERT_ADV');
    expect(convertSecInfoEnum('ovaldef')).toEqual('OVALDEF');

    expect(convertSecInfoEnum('foobar')).toEqual(null);
    expect(convertSecInfoEnum()).toEqual(null);
  });

  test('convertDirectionEnum', () => {
    expect(convertDirectionEnum('increased')).toEqual('INCREASED');
    expect(convertDirectionEnum('decreased')).toEqual('DECREASED');
    expect(convertDirectionEnum('changed')).toEqual('CHANGED');

    expect(convertDirectionEnum('foobar')).toEqual(null);
    expect(convertDirectionEnum()).toEqual(null);
  });

  test('convertFeedEventEnum', () => {
    expect(convertFeedEventEnum('new')).toEqual('NEW');
    expect(convertFeedEventEnum('updated')).toEqual('UPDATED');

    expect(convertFeedEventEnum('foobar')).toEqual(null);
    expect(convertFeedEventEnum()).toEqual(null);
  });

  test('convertTaskStatusEnum', () => {
    expect(convertTaskStatusEnum('New')).toEqual('NEW');
    expect(convertTaskStatusEnum('Done')).toEqual('DONE');
    expect(convertTaskStatusEnum('Requested')).toEqual('REQUESTED');
    expect(convertTaskStatusEnum('Running')).toEqual('RUNNING');
    expect(convertTaskStatusEnum('Stop Requested')).toEqual('STOP_REQUESTED');
    expect(convertTaskStatusEnum('Stopped')).toEqual('STOPPED');

    expect(convertTaskStatusEnum('foobar')).toEqual(null);
    expect(convertTaskStatusEnum()).toEqual(null);
  });

  test('convertDeltaTypeEnum', () => {
    expect(convertDeltaTypeEnum('None')).toEqual('NONE');
    expect(convertDeltaTypeEnum('Report')).toEqual('REPORT');
    expect(convertDeltaTypeEnum('Previous')).toEqual('PREVIOUS');

    expect(convertDeltaTypeEnum('foobar')).toEqual(null);
    expect(convertDeltaTypeEnum()).toEqual(null);
  });

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
    expect(convertConditionEnum(CONDITION_TYPE_SEVERITY_CHANGED)).toEqual(
      'SEVERITY_CHANGED',
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
    expect(convertEventEnum(EVENT_TYPE_TICKET_RECEIVED)).toEqual(
      'TICKET_RECEIVED',
    );
    expect(convertEventEnum(EVENT_TYPE_ASSIGNED_TICKET_CHANGED)).toEqual(
      'ASSIGNED_TICKET_CHANGED',
    );
    expect(convertEventEnum(EVENT_TYPE_OWNED_TICKET_CHANGED)).toEqual(
      'OWNED_TICKET_CHANGED',
    );
    expect(convertEventEnum(EVENT_TYPE_NEW_SECINFO, 'updated')).toEqual(
      'UPDATED_SECINFO_ARRIVED',
    );
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
    expect(convertMethodEnum(METHOD_TYPE_TIPPING_POINT)).toEqual(
      'TIPPINGPOINT',
    );
    expect(convertMethodEnum(METHOD_TYPE_ALEMBA_VFIRE)).toEqual('ALEMBA_VFIRE');

    expect(convertMethodEnum('foobar')).toEqual(null);
    expect(convertMethodEnum()).toEqual(null);
  });
});

const pkcs12Blob = new Blob(['Hello world!'], {type: 'application/x-pkcs12'});

const methodData = {
  method_data_URL: 'foo.bar',
  method_data_defense_center_ip: '123.456.789.0',
  method_data_defense_center_port: '8307',
  method_data_delta_report_id: '12345',
  method_data_delta_type: 'Previous',
  method_data_details_url: 'https://secinfo.greenbone.net/etc',
  method_data_from_address: 'foo@bar.com',
  method_data_message: 'A quick brown fox jumped over the lazy dog.',
  method_data_message_attach: 'roses are red',
  method_data_notice: '{notice}',
  method_data_notice_attach_format: '12345',
  method_data_notice_report_format: '12345',
  method_data_pkcs12: pkcs12Blob,
  method_data_pkcs12_credential: '12345',
  method_data_recipient_credential: '12345',
  method_data_scp_host: 'localhost',
  method_data_scp_known_hosts: '192.168.10.130',
  method_data_scp_path: 'report.xml',
  method_data_scp_report_format: '12345',
  method_data_scp_credential: '12345',
  method_data_send_host: 'localhost',
  method_data_send_port: '8080',
  method_data_send_report_format: '12345',
  method_data_smb_credential: '12345',
  method_data_smb_file_path: 'report.xml',
  method_data_smb_share_path: 'gvm-reports',
  method_data_snmp_agent: 'localhost',
  method_data_snmp_community: 'public',
  method_data_snmp_message: '$e',
  method_data_start_task_task: '12345',
  method_data_subject: "[GVM] Task '$n': $e",
  method_data_submethod: 'syslog',
  method_data_to_address: 'foo@bar.com',
  method_data_tp_sms_hostname: 'fluffy',
  method_data_tp_sms_tls_workaround: 0,
  method_data_verinice_server_credential: '12345',
  method_data_verinice_server_report_format: '12345',
  method_data_verinice_server_url: 'localhost',
};

const eventData = {
  event_data_feed_event: 'new',
  event_data_secinfo_type: 'dfn_cert_adv',
  event_data_status: 'Done',
};

const conditionData = {
  condition_data_at_least_count: 1,
  condition_data_count: 0,
  condition_data_direction: 'decreased',
  condition_data_severity: 0.1,
  condition_data_at_least_filter_id: '23456',
};

describe('Alert data dictionary parsing tests', () => {
  test('Should convert method data correctly', async () => {
    const convertedBlob = await fileToBase64(pkcs12Blob);
    const convertedDict = await convertDict(
      'method_data',
      methodData,
      method_data_fields,
    );
    expect(convertedDict).toEqual({
      URL: 'foo.bar',
      defense_center_ip: '123.456.789.0',
      defense_center_port: 8307,
      delta_report_id: '12345',
      delta_type: 'PREVIOUS',
      details_url: 'https://secinfo.greenbone.net/etc',
      from_address: 'foo@bar.com',
      message: 'A quick brown fox jumped over the lazy dog.',
      message_attach: 'roses are red',
      notice: '{notice}',
      notice_attach_format: '12345',
      notice_report_format: '12345',
      pkcs12: convertedBlob,
      pkcs12_credential: '12345',
      recipient_credential: '12345',
      scp_host: 'localhost',
      scp_known_hosts: '192.168.10.130',
      scp_path: 'report.xml',
      scp_report_format: '12345',
      scp_credential: '12345',
      send_host: 'localhost',
      send_port: 8080,
      send_report_format: '12345',
      smb_credential: '12345',
      smb_file_path: 'report.xml',
      smb_share_path: 'gvm-reports',
      snmp_agent: 'localhost',
      snmp_community: 'public',
      snmp_message: '$e',
      start_task_task: '12345',
      subject: "[GVM] Task '$n': $e",
      submethod: 'syslog',
      to_address: 'foo@bar.com',
      tp_sms_hostname: 'fluffy',
      tp_sms_tls_workaround: 0,
      verinice_server_credential: '12345',
      verinice_server_report_format: '12345',
      verinice_server_url: 'localhost',
    });
  });

  test('Should convert event data correctly', async () => {
    const convertedDict = await convertDict(
      'event_data',
      eventData,
      event_data_fields,
    );
    expect(convertedDict).toEqual({
      feed_event: 'NEW',
      secinfo_type: 'DFN_CERT_ADV',
      status: 'DONE',
    });
  });

  test('Should convert condition data correctly', async () => {
    const convertedDict = await convertDict(
      'condition_data',
      conditionData,
      condition_data_fields,
    );
    expect(convertedDict).toEqual({
      at_least_count: 1,
      at_least_filter_id: '23456',
      count: 0,
      direction: 'DECREASED',
      severity: 0.1,
    });
  });
});

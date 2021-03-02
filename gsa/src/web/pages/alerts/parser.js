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

import {isString} from 'gmp/utils/identity';

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

export const fileToBase64 = file => {
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = function (event) {
      // Remove data url declaration
      resolve(event.target.result.substring(33));
    };

    reader.readAsDataURL(file);
  });
};

export const convertSecInfoEnum = infoType => {
  switch (infoType) {
    case 'nvt':
      return 'NVT';
    case 'cve':
      return 'CVE';
    case 'cpe':
      return 'CPE';
    case 'cert_bund_adv':
      return 'CERT_BUND_ADV';
    case 'dfn_cert_adv':
      return 'DFN_CERT_ADV';
    case 'ovaldef':
      return 'OVALDEF';
    default:
      return null;
  }
};

export const convertDirectionEnum = directionType => {
  switch (directionType) {
    case 'increased':
      return 'INCREASED';
    case 'decreased':
      return 'DECREASED';
    case 'changed':
      return 'CHANGED';
    default:
      return null;
  }
};

export const convertFeedEventEnum = feedEvent => {
  switch (feedEvent) {
    case 'new':
      return 'NEW';
    case 'updated':
      return 'UPDATED';
    default:
      return null;
  }
};

export const convertTaskStatusEnum = status => {
  switch (status) {
    case 'New':
      return 'NEW';
    case 'Done':
      return 'DONE';
    case 'Requested':
      return 'REQUESTED';
    case 'Running':
      return 'RUNNING';
    case 'Stop Requested':
      return 'STOP_REQUESTED';
    case 'Stopped':
      return 'STOPPED';
    default:
      return null;
  }
};

export const convertDeltaTypeEnum = deltaType => {
  switch (deltaType) {
    case 'None':
      return 'NONE';
    case 'Report':
      return 'REPORT';
    case 'Previous':
      return 'PREVIOUS';
    default:
      return null;
  }
};

export const convertDict = async (prefix, data, fields) => {
  const fieldDict = {};
  for (const field of fields) {
    const name = prefix + '_' + field;
    if (data.hasOwnProperty(name)) {
      if (field === 'pkcs12') {
        const base64File = await fileToBase64(data[name]);
        fieldDict[field] = base64File;
      } else if (field === 'secinfo_type') {
        fieldDict[field] = convertSecInfoEnum(data[name]);
      } else if (field === 'direction') {
        fieldDict[field] = convertDirectionEnum(data[name]);
      } else if (field === 'feed_event') {
        fieldDict[field] = convertFeedEventEnum(data[name]);
      } else if (field === 'status') {
        fieldDict[field] = convertTaskStatusEnum(data[name]);
      } else if (field === 'delta_type') {
        fieldDict[field] = convertDeltaTypeEnum(data[name]);
      } else if (field === 'delta_report_id') {
        fieldDict[field] = data[name] === '' ? null : data[name];
      } else if (field === 'send_port' || field === 'defense_center_port') {
        fieldDict[field] = isString(data[name])
          ? parseInt(data[name])
          : data[name];
      } else {
        fieldDict[field] = data[name];
      }
    }
  }
  return fieldDict;
};

export const convertConditionEnum = condition => {
  switch (condition) {
    case CONDITION_TYPE_ALWAYS:
      return 'ALWAYS';
    case CONDITION_TYPE_FILTER_COUNT_AT_LEAST:
      return 'FILTER_COUNT_AT_LEAST';
    case CONDITION_TYPE_FILTER_COUNT_CHANGED:
      return 'FILTER_COUNT_CHANGED';
    case CONDITION_TYPE_SEVERITY_AT_LEAST:
      return 'SEVERITY_AT_LEAST';
    case CONDITION_TYPE_SEVERITY_CHANGED:
      return 'SEVERITY_CHANGED';
    default:
      return null;
  }
};

export const convertEventEnum = (event, feedEvent = '') => {
  switch (event) {
    case EVENT_TYPE_TASK_RUN_STATUS_CHANGED:
      return 'TASK_RUN_STATUS_CHANGED';
    case EVENT_TYPE_UPDATED_SECINFO:
      return 'UPDATED_SECINFO_ARRIVED';
    case EVENT_TYPE_NEW_SECINFO:
      if (feedEvent === 'updated') {
        return 'UPDATED_SECINFO_ARRIVED';
      }
      return 'NEW_SECINFO_ARRIVED';
    case EVENT_TYPE_TICKET_RECEIVED:
      return 'TICKET_RECEIVED';
    case EVENT_TYPE_ASSIGNED_TICKET_CHANGED:
      return 'ASSIGNED_TICKET_CHANGED';
    case EVENT_TYPE_OWNED_TICKET_CHANGED:
      return 'OWNED_TICKET_CHANGED';
    default:
      return null;
  }
};

export const convertMethodEnum = method => {
  switch (method) {
    case METHOD_TYPE_ALEMBA_VFIRE:
      return 'ALEMBA_VFIRE';
    case METHOD_TYPE_SCP:
      return 'SCP';
    case METHOD_TYPE_SEND:
      return 'SEND';
    case METHOD_TYPE_SMB:
      return 'SMB';
    case METHOD_TYPE_SNMP:
      return 'SNMP';
    case METHOD_TYPE_SYSLOG:
      return 'SYSLOG';
    case METHOD_TYPE_EMAIL:
      return 'EMAIL';
    case METHOD_TYPE_START_TASK:
      return 'START_TASK';
    case METHOD_TYPE_HTTP_GET:
      return 'HTTP_GET';
    case METHOD_TYPE_SOURCEFIRE:
      return 'SOURCEFIRE_CONNECTOR';
    case METHOD_TYPE_VERINICE:
      return 'VERINICE_CONNECTOR';
    case METHOD_TYPE_TIPPING_POINT:
      return 'TIPPINGPOINT';
    default:
      return null;
  }
};

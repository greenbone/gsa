/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {type Date} from 'gmp/models/date';
import Model, {type ModelElement, type ModelProperties} from 'gmp/models/model';
import {
  parseDate,
  parseText,
  parseToString,
  parseYesNo,
  YES_VALUE,
  type YesNo,
} from 'gmp/parser';
import {forEach, map} from 'gmp/utils/array';
import {isDefined, isObject} from 'gmp/utils/identity';
import {isEmpty} from 'gmp/utils/string';

interface DataElement {
  name: string;
  __text?: string | number;
}

interface AlertDataElement {
  __text?: string;
  data?: DataElement | DataElement[];
}

interface AlertTaskElement extends ModelElement {
  usage_type?: 'scan' | 'audit';
}

interface AlertElement extends ModelElement {
  active?: YesNo;
  condition?: string | AlertDataElement;
  event?: string | AlertDataElement;
  filter?: ModelElement;
  method?: AlertDataElement;
  tasks?: {
    task: AlertTaskElement | AlertTaskElement[];
  };
}

export interface AlertData {
  type?: string;
  data?: Record<string, {value?: string | number}>;
}

interface MethodData extends AlertData {
  type?: string;
  data: Record<string, {value?: string | number}> & {
    report_formats?: string[];
    notice?: {value?: string};
  };
}

interface AlertProperties extends ModelProperties {
  active?: YesNo;
  condition?: AlertData;
  event?: AlertData;
  filter?: Model;
  method?: MethodData;
  tasks?: Model[];
}

export type AlertEventType =
  | typeof EVENT_TYPE_NEW_SECINFO
  | typeof EVENT_TYPE_UPDATED_SECINFO
  | typeof EVENT_TYPE_TASK_RUN_STATUS_CHANGED
  | typeof EVENT_TYPE_TICKET_RECEIVED
  | typeof EVENT_TYPE_ASSIGNED_TICKET_CHANGED
  | typeof EVENT_TYPE_OWNED_TICKET_CHANGED;

export type AlertConditionType =
  | typeof CONDITION_TYPE_FILTER_COUNT_AT_LEAST
  | typeof CONDITION_TYPE_FILTER_COUNT_CHANGED
  | typeof CONDITION_TYPE_SEVERITY_AT_LEAST
  | typeof CONDITION_TYPE_ALWAYS;

export type AlertConditionDirection =
  | typeof CONDITION_DIRECTION_DECREASED
  | typeof CONDITION_DIRECTION_INCREASED
  | typeof CONDITION_DIRECTION_CHANGED;

export type AlertMethodType =
  | typeof METHOD_TYPE_ALEMBA_VFIRE
  | typeof METHOD_TYPE_SCP
  | typeof METHOD_TYPE_SEND
  | typeof METHOD_TYPE_SMB
  | typeof METHOD_TYPE_SNMP
  | typeof METHOD_TYPE_SYSLOG
  | typeof METHOD_TYPE_EMAIL
  | typeof METHOD_TYPE_START_TASK
  | typeof METHOD_TYPE_HTTP_GET
  | typeof METHOD_TYPE_SOURCEFIRE
  | typeof METHOD_TYPE_VERINICE
  | typeof METHOD_TYPE_TIPPING_POINT;

export const EVENT_TYPE_UPDATED_SECINFO = 'Updated SecInfo arrived';
export const EVENT_TYPE_NEW_SECINFO = 'New SecInfo arrived';
export const EVENT_TYPE_TASK_RUN_STATUS_CHANGED = 'Task run status changed';
export const EVENT_TYPE_TICKET_RECEIVED = 'Ticket received';
export const EVENT_TYPE_ASSIGNED_TICKET_CHANGED = 'Assigned ticket changed';
export const EVENT_TYPE_OWNED_TICKET_CHANGED = 'Owned ticket changed';

export const CONDITION_TYPE_FILTER_COUNT_AT_LEAST = 'Filter count at least';
export const CONDITION_TYPE_FILTER_COUNT_CHANGED = 'Filter count changed';
export const CONDITION_TYPE_SEVERITY_AT_LEAST = 'Severity at least';
export const CONDITION_TYPE_ALWAYS = 'Always';

export const CONDITION_DIRECTION_DECREASED = 'decreased';
export const CONDITION_DIRECTION_INCREASED = 'increased';
export const CONDITION_DIRECTION_CHANGED = 'changed';

export const METHOD_TYPE_ALEMBA_VFIRE = 'Alemba vFire';
export const METHOD_TYPE_SCP = 'SCP';
export const METHOD_TYPE_SEND = 'Send';
export const METHOD_TYPE_SMB = 'SMB';
export const METHOD_TYPE_SNMP = 'SNMP';
export const METHOD_TYPE_SYSLOG = 'Syslog';
export const METHOD_TYPE_EMAIL = 'Email';
export const METHOD_TYPE_START_TASK = 'Start Task';
export const METHOD_TYPE_HTTP_GET = 'HTTP Get';
export const METHOD_TYPE_SOURCEFIRE = 'Sourcefire Connector';
export const METHOD_TYPE_VERINICE = 'verinice Connector';
export const METHOD_TYPE_TIPPING_POINT = 'TippingPoint SMS';

export const EMAIL_NOTICE_INCLUDE = '0';
export const EMAIL_NOTICE_SIMPLE = '1';
export const EMAIL_NOTICE_ATTACH = '2';

export const DELTA_TYPE_NONE = 'None';
export const DELTA_TYPE_PREVIOUS = 'Previous';
export const DELTA_TYPE_REPORT = 'Report';

export const isTaskEvent = (event?: string) =>
  event === EVENT_TYPE_TASK_RUN_STATUS_CHANGED;
export const isTicketEvent = (event?: string) =>
  event === EVENT_TYPE_ASSIGNED_TICKET_CHANGED ||
  event === EVENT_TYPE_OWNED_TICKET_CHANGED ||
  event === EVENT_TYPE_TICKET_RECEIVED;
export const isSecinfoEvent = (event?: string) =>
  event === EVENT_TYPE_NEW_SECINFO || event === EVENT_TYPE_UPDATED_SECINFO;

const createValues = (data: DataElement) => {
  const value = isEmpty(data.__text as string) ? undefined : data.__text;
  const values = {value};
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const {__text, name, ...other} = data;

  for (const [key, obj] of Object.entries<
    DataElement & {_id?: string; id?: string} & {
      activation_time?: string;
      expiration_time?: string;
      activationTime?: Date;
      expirationTime?: Date;
    }
  >(other)) {
    if (isDefined(obj._id)) {
      if (obj._id.length > 0) {
        obj.id = obj._id;
      }
      delete obj._id;
    }
    if (key === 'certificate_info') {
      obj.activationTime = parseDate(obj.activation_time);
      obj.expirationTime = parseDate(obj.expiration_time);
      delete obj.activation_time;
      delete obj.expiration_time;
    }
    values[key] = obj;
  }

  return values;
};

const parseAlertData = (
  alertElement: AlertDataElement | string | undefined,
): AlertData | undefined => {
  const data = {};
  if (!isDefined(alertElement)) {
    return undefined;
  }
  if (isObject(alertElement)) {
    forEach(alertElement.data, value => {
      data[value.name] = createValues(value);
    });
  }
  return {
    type: parseText(alertElement),
    data,
  };
};

class Alert extends Model {
  static readonly entityType = 'alert';

  readonly active?: YesNo;
  readonly condition?: AlertData;
  readonly event?: AlertData;
  readonly filter?: Model;
  readonly method?: MethodData;
  readonly tasks: Model[];

  constructor({
    active,
    condition,
    event,
    filter,
    method,
    tasks = [],
    ...properties
  }: AlertProperties = {}) {
    super(properties);

    this.active = active;
    this.condition = condition;
    this.event = event;
    this.filter = filter;
    this.method = method;
    this.tasks = tasks;
  }

  static fromElement(element?: AlertElement): Alert {
    return new Alert(this.parseElement(element));
  }

  static parseElement(element: AlertElement = {}): AlertProperties {
    const ret = super.parseElement(element) as AlertProperties;

    ret.condition = parseAlertData(element.condition);
    ret.event = parseAlertData(element.event);
    ret.method = parseAlertData(element.method) as MethodData;

    if (isDefined(ret.filter)) {
      ret.filter = Model.fromElement(element.filter, 'filter');
    }

    ret.tasks = map(element.tasks?.task, task => {
      // Use 'audit' entity type for audits, 'task' for scans
      const entityType = task.usage_type === 'audit' ? 'audit' : 'task';
      return Model.fromElement(task, entityType);
    });

    if (isDefined(ret.method?.data?.report_formats)) {
      // @ts-expect-error
      const methodDataReportFormat = ret.method?.data?.report_formats?.value as
        | string
        | undefined;

      ret.method.data.report_formats = map(
        methodDataReportFormat?.split(','),
        rf => rf.trim(),
      );
    }

    if (isDefined(ret.method?.data?.notice)) {
      ret.method.data.notice = {
        value: parseToString(ret.method?.data?.notice?.value),
      };
    }

    ret.active = isDefined(element.active)
      ? parseYesNo(element.active)
      : undefined;

    return ret;
  }

  isActive() {
    return this.active === YES_VALUE;
  }
}

export default Alert;

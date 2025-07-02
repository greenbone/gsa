/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {_l} from 'gmp/locale/lang';
import {Duration} from 'gmp/models/date';
import Model, {ModelElement, ModelProperties} from 'gmp/models/model';
import Report from 'gmp/models/report';
import Scanner, {ScannerType} from 'gmp/models/scanner';
import Schedule from 'gmp/models/schedule';
import {
  parseInt,
  parseProgressElement,
  parseYesNo,
  parseYes,
  parseIntoArray,
  parseDuration,
  NO_VALUE,
  YesNo,
  parseToString,
} from 'gmp/parser';
import {map} from 'gmp/utils/array';
import {isDefined, isArray, isString} from 'gmp/utils/identity';
import {isEmpty} from 'gmp/utils/string';

export const AUTO_DELETE_KEEP = 'keep';
export const AUTO_DELETE_NO = 'no';
export const AUTO_DELETE_KEEP_DEFAULT_VALUE = 5;

export const HOSTS_ORDERING_SEQUENTIAL = 'sequential';
export const HOSTS_ORDERING_RANDOM = 'random';
export const HOSTS_ORDERING_REVERSE = 'reverse';

export const DEFAULT_MAX_CHECKS = 4;
export const DEFAULT_MAX_HOSTS = 20;
export const DEFAULT_MIN_QOD = 70;

export const TASK_STATUS = {
  queued: 'Queued',
  running: 'Running',
  stoprequested: 'Stop Requested',
  deleterequested: 'Delete Requested',
  ultimatedeleterequested: 'Ultimate Delete Requested',
  resumerequested: 'Resume Requested',
  requested: 'Requested',
  stopped: 'Stopped',
  new: 'New',
  interrupted: 'Interrupted',
  container: 'Container',
  uploading: 'Uploading',
  uploadinginterrupted: 'Uploading Interrupted',
  processing: 'Processing',
  done: 'Done',
} as const;

export type TaskHostsOrdering =
  | typeof HOSTS_ORDERING_SEQUENTIAL
  | typeof HOSTS_ORDERING_RANDOM
  | typeof HOSTS_ORDERING_REVERSE;
export type TaskStatus = (typeof TASK_STATUS)[keyof typeof TASK_STATUS];
export type TaskUsageType = 'scan' | 'audit';
export type TaskTrend = 'up' | 'down' | 'more' | 'less' | 'same';
export type TaskAutoDelete = typeof AUTO_DELETE_KEEP | typeof AUTO_DELETE_NO;

const TASK_STATUS_TRANSLATIONS = {
  Running: _l('Running'),
  'Stop Requested': _l('Stop Requested'),
  'Delete Requested': _l('Delete Requested'),
  'Ultimate Delete Requested': _l('Ultimate Delete Requested'),
  'Resume Requested': _l('Resume Requested'),
  Requested: _l('Requested'),
  Stopped: _l('Stopped'),
  New: _l('New'),
  Interrupted: _l('Interrupted'),
  Container: _l('Container'),
  Uploading: _l('Uploading'),
  Done: _l('Done'),
  Queued: _l('Queued'),
  Processing: _l('Processing'),
  'Uploading Interrupted': _l('Interrupted'),
} as const;

export const getTranslatableTaskStatus = (status: TaskStatus) =>
  `${TASK_STATUS_TRANSLATIONS[status]}`;

export const isActive = (status?: TaskStatus) =>
  status === TASK_STATUS.running ||
  status === TASK_STATUS.stoprequested ||
  status === TASK_STATUS.deleterequested ||
  status === TASK_STATUS.ultimatedeleterequested ||
  status === TASK_STATUS.resumerequested ||
  status === TASK_STATUS.requested ||
  status === TASK_STATUS.queued ||
  status === TASK_STATUS.processing;

interface TaskPreferenceElement {
  name?: string;
  scanner_name: string;
  value?: string | number;
}

interface TaskAlertElement {
  _id?: string;
  name?: string;
}

interface TaskElement extends ModelElement {
  alert?: TaskAlertElement | TaskAlertElement[];
  alterable?: YesNo;
  average_duration?: number;
  config?: {
    _id?: string;
    name?: string;
    trash?: YesNo;
  };
  current_report?: {
    report?: {
      _id?: string;
      timestamp?: string;
      scan_start?: string;
      scan_end?: string;
    };
  };
  hosts_ordering?: TaskHostsOrdering;
  last_report?: {
    report?: {
      _id?: string;
      result_count?: {
        false_positive?: number;
        hole?: {
          __text?: number;
          _deprecated: '1';
        };
        info?: {
          __text?: number;
          _deprecated: '1';
        };
        high?: number;
        low?: number;
        medium?: number;
        warning?: {
          __text?: number;
          _deprecated: '1';
        };
      };
      scan_end?: string;
      scan_start?: string;
      severity?: number;
      timestamp?: string;
    };
  };
  observers?:
    | string
    | {
        __text?: string;
        user?: string | string[];
        role?: string | string[];
        group?: string | string[];
      };
  preferences?: {
    preference?: TaskPreferenceElement | TaskPreferenceElement[];
  };
  progress?: number | {__text?: number};
  report_count?: {
    __text?: number;
    finished?: number;
  };
  result_count?: number;
  scanner?: {
    _id?: string;
    name?: string;
    trash?: YesNo;
    type?: ScannerType;
  };
  schedule?: {
    _id?: string;
    icalendar?: string;
    name?: string;
    timezone?: string;
    trash?: YesNo;
  };
  schedule_periods?: number;
  slave?: {
    _id?: string;
  };
  status?: TaskStatus;
  target?: {
    _id?: string;
    name?: string;
    trash?: YesNo;
  };
  trend?: TaskTrend;
  usage_type?: TaskUsageType;
}

interface ReportCount {
  total?: number;
  finished?: number;
}

interface TaskPreferences {
  [key: string]: {
    value: string | number;
    name?: string;
  };
}

interface TaskSlave {
  id?: string;
}

interface TaskObservers {
  user?: string | string[];
  role?: string | string[];
  group?: string | string[];
}

interface TaskProperties extends ModelProperties {
  alerts?: Model[];
  alterable?: YesNo;
  average_duration?: Duration;
  config?: Model;
  current_report?: Report;
  hosts_ordering?: TaskHostsOrdering;
  last_report?: Report;
  observers?: TaskObservers;
  preferences?: TaskPreferences;
  progress?: number;
  report_count?: ReportCount;
  result_count?: number;
  scanner?: Scanner;
  schedule?: Schedule;
  schedule_periods?: number;
  slave?: TaskSlave;
  status?: TaskStatus;
  target?: Model;
  trend?: TaskTrend;
  usageType?: TaskUsageType;
  // from preferences
  apply_overrides?: YesNo;
  auto_delete_data?: number;
  auto_delete?: TaskAutoDelete;
  in_assets?: YesNo;
  max_checks?: number;
  max_hosts?: number;
  min_qod?: number;
}

class Task extends Model {
  static readonly entityType = 'task';

  readonly alerts: Model[];
  readonly alterable?: YesNo;
  readonly apply_overrides?: YesNo;
  readonly auto_delete_data?: number;
  readonly auto_delete?: TaskAutoDelete;
  readonly average_duration?: Duration;
  readonly config?: Model;
  readonly current_report?: Report;
  readonly hosts_ordering?: TaskHostsOrdering;
  readonly in_assets?: YesNo;
  readonly last_report?: Report;
  readonly max_checks?: number;
  readonly max_hosts?: number;
  readonly min_qod?: number;
  readonly observers?: TaskObservers;
  readonly preferences: TaskPreferences;
  readonly progress?: number;
  readonly report_count?: ReportCount;
  readonly result_count?: number;
  readonly scanner?: Scanner;
  readonly schedule_periods?: number;
  readonly schedule?: Schedule;
  readonly slave?: TaskSlave;
  readonly status: TaskStatus;
  readonly target?: Model;
  readonly trend?: TaskTrend;
  readonly usageType?: TaskUsageType;

  constructor({
    alerts = [],
    alterable,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    apply_overrides,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    auto_delete_data,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    auto_delete,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    average_duration,
    config,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    current_report,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    hosts_ordering,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    in_assets,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    last_report,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    max_checks,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    max_hosts,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    min_qod,
    observers,
    preferences = {},
    progress,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    report_count,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    result_count,
    scanner,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    schedule_periods,
    schedule,
    slave,
    status = TASK_STATUS.unknown,
    target,
    trend,
    usageType,
    ...properties
  }: TaskProperties = {}) {
    super(properties);

    this.alerts = alerts;
    this.alterable = alterable;
    this.apply_overrides = apply_overrides;
    this.auto_delete_data = auto_delete_data;
    this.auto_delete = auto_delete;
    this.average_duration = average_duration;
    this.config = config;
    this.current_report = current_report;
    this.hosts_ordering = hosts_ordering;
    this.in_assets = in_assets;
    this.last_report = last_report;
    this.max_checks = max_checks;
    this.max_hosts = max_hosts;
    this.min_qod = min_qod;
    this.observers = observers;
    this.preferences = preferences;
    this.progress = progress;
    this.report_count = report_count;
    this.result_count = result_count;
    this.scanner = scanner;
    this.schedule_periods = schedule_periods;
    this.schedule = schedule;
    this.slave = slave;
    this.status = status;
    this.target = target;
    this.trend = trend;
    this.usageType = usageType;
  }

  static fromElement(element?: TaskElement): Task {
    return new Task(this.parseElement(element));
  }

  static parseElement(element: TaskElement = {}): TaskProperties {
    const copy = super.parseElement(element) as TaskProperties;

    const {report_count} = element;

    if (isDefined(report_count)) {
      copy.report_count = {
        total: parseInt(report_count.__text),
        finished: parseInt(report_count.finished),
      };
    }

    if (isDefined(element.observers)) {
      copy.observers = {};
      if (isString(element.observers)) {
        copy.observers.user = isEmpty(element.observers)
          ? []
          : element.observers.split(' ');
      } else {
        if (isDefined(element.observers?.__text)) {
          copy.observers.user = (
            parseToString(element.observers.__text) as string
          ).split(' ');
        }
        if (isDefined(element.observers.role)) {
          copy.observers.role = parseIntoArray(element.observers.role);
        }
        if (isDefined(element.observers.group)) {
          copy.observers.group = parseIntoArray(element.observers.group);
        }
      }
    }

    copy.alterable = isDefined(element.alterable)
      ? parseYesNo(element.alterable)
      : undefined;
    copy.result_count = parseInt(element.result_count);
    copy.trend = parseToString(element.trend) as TaskTrend;

    copy.last_report = isEmpty(element.last_report?.report?._id)
      ? undefined
      : Report.fromElement(element.last_report?.report);
    copy.current_report = isEmpty(element.current_report?.report?._id)
      ? undefined
      : Report.fromElement(element.current_report?.report);

    copy.config = isEmpty(element.config?._id)
      ? undefined
      : Model.fromElement(element.config, 'scanconfig');
    copy.target = isEmpty(element.target?._id)
      ? undefined
      : Model.fromElement(element.target, 'target');
    // slave isn't really an entity type but it has an id
    copy.slave = isEmpty(element.slave?._id)
      ? undefined
      : {id: element.slave?._id};
    copy.alerts = map(element.alert, alert =>
      Model.fromElement(alert, 'alert'),
    );
    copy.scanner = isEmpty(element.scanner?._id)
      ? undefined
      : Scanner.fromElement(element.scanner);
    copy.schedule = isEmpty(element.schedule?._id)
      ? undefined
      : Schedule.fromElement(element.schedule);
    copy.schedule_periods = parseInt(element.schedule_periods);

    // it seems element.progress is just a number now, but keep the element parsing as a fallback
    // maybe some other code path relies on the other format
    copy.progress = isDefined(element.progress)
      ? parseProgressElement(element.progress)
      : undefined;

    const prefs = {};

    if (isArray(element.preferences?.preference)) {
      for (const pref of element.preferences.preference) {
        switch (pref.scanner_name) {
          case 'in_assets':
            copy.in_assets = parseYes(pref.value as string);
            break;
          case 'assets_apply_overrides':
            copy.apply_overrides = parseYes(pref.value as string);
            break;
          case 'assets_min_qod':
            copy.min_qod = parseInt(pref.value);
            break;
          case 'auto_delete':
            copy.auto_delete =
              pref.value === AUTO_DELETE_KEEP
                ? AUTO_DELETE_KEEP
                : AUTO_DELETE_NO;
            break;
          case 'auto_delete_data': {
            const value = parseInt(pref.value);
            copy.auto_delete_data =
              value === 0 ? AUTO_DELETE_KEEP_DEFAULT_VALUE : value;
            break;
          }
          case 'max_hosts':
          case 'max_checks':
            copy[pref.scanner_name] = parseInt(pref.value);
            break;
          default:
            prefs[pref.scanner_name] = {value: pref.value, name: pref.name};
            break;
        }
      }
    }

    copy.preferences = prefs;

    copy.average_duration = parseDuration(element.average_duration);

    if (
      element.hosts_ordering === HOSTS_ORDERING_RANDOM ||
      element.hosts_ordering === HOSTS_ORDERING_REVERSE ||
      element.hosts_ordering === HOSTS_ORDERING_SEQUENTIAL
    ) {
      copy.hosts_ordering = element.hosts_ordering as TaskHostsOrdering;
    } else {
      delete copy.hosts_ordering;
    }

    copy.usageType = element.usage_type;

    return copy;
  }
  isActive() {
    return isActive(this.status);
  }

  isRunning() {
    return this.status === TASK_STATUS.running;
  }

  isStopped() {
    return this.status === TASK_STATUS.stopped;
  }

  isInterrupted() {
    return this.status === TASK_STATUS.interrupted;
  }

  isQueued() {
    return this.status === TASK_STATUS.queued;
  }

  isNew() {
    return this.status === TASK_STATUS.new;
  }

  isChangeable() {
    return this.isNew() || this.isAlterable();
  }

  isAlterable() {
    return this.alterable !== NO_VALUE;
  }

  isContainer() {
    return !isDefined(this.target);
  }

  getTranslatableStatus() {
    return getTranslatableTaskStatus(this.status as TaskStatus);
  }
}

export default Task;

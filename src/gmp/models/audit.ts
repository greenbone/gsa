/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {Duration} from 'gmp/models/date';
import Model from 'gmp/models/model';
import Report from 'gmp/models/report';
import Scanner from 'gmp/models/scanner';
import Schedule from 'gmp/models/schedule';
import Task, {
  AUTO_DELETE_KEEP,
  AUTO_DELETE_NO,
  AUTO_DELETE_KEEP_DEFAULT_VALUE,
  HOSTS_ORDERING_SEQUENTIAL,
  HOSTS_ORDERING_RANDOM,
  HOSTS_ORDERING_REVERSE,
  DEFAULT_MAX_CHECKS,
  DEFAULT_MAX_HOSTS,
  DEFAULT_MIN_QOD,
  TASK_STATUS as AUDIT_STATUS,
  getTranslatableTaskStatus as getTranslatableAuditStatus,
  isActive,
  TaskElement,
  TaskProperties,
  TaskTrend,
  ReportCount,
  TaskSlave,
  TaskObservers,
  TaskPreferences,
  TaskHostsOrdering,
  TaskAutoDelete,
  USAGE_TYPE,
  TaskReport,
} from 'gmp/models/task';
import {NO_VALUE, YesNo} from 'gmp/parser';
import {isDefined} from 'gmp/utils/identity';

export type AuditStatus = (typeof AUDIT_STATUS)[keyof typeof AUDIT_STATUS];

type AuditElement = TaskElement;

interface AuditProperties extends Omit<TaskProperties, 'status'> {
  status?: AuditStatus;
}

export {
  AUTO_DELETE_KEEP,
  AUTO_DELETE_NO,
  AUTO_DELETE_KEEP_DEFAULT_VALUE,
  HOSTS_ORDERING_SEQUENTIAL,
  HOSTS_ORDERING_RANDOM,
  HOSTS_ORDERING_REVERSE,
  DEFAULT_MAX_CHECKS,
  DEFAULT_MAX_HOSTS,
  DEFAULT_MIN_QOD,
  AUDIT_STATUS,
  USAGE_TYPE,
  getTranslatableAuditStatus,
  isActive,
};

class Audit extends Model {
  static readonly entityType = 'audit';

  readonly alerts: Model[];
  readonly alterable?: YesNo;
  readonly apply_overrides?: YesNo;
  readonly auto_delete_data?: number;
  readonly auto_delete?: TaskAutoDelete;
  readonly average_duration?: Duration;
  readonly config?: Model;
  readonly current_report?: TaskReport;
  readonly first_report?: Report;
  readonly hosts_ordering?: TaskHostsOrdering;
  readonly in_assets?: YesNo;
  readonly last_report?: TaskReport;
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
  readonly second_last_report?: Report;
  readonly slave?: TaskSlave;
  readonly status: AuditStatus;
  readonly target?: Model;
  readonly trend?: TaskTrend;
  readonly usageType = USAGE_TYPE.audit;

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
    status = AUDIT_STATUS.unknown,
    target,
    trend,
    ...properties
  }: AuditProperties = {}) {
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
  }

  static fromElement(element: AuditElement = {}): Audit {
    if (
      isDefined(element?.usage_type) &&
      element.usage_type !== USAGE_TYPE.audit
    ) {
      throw new Error("Audit.parseElement: usage_type must be 'audit'");
    }
    return new Audit(this.parseElement(element));
  }

  static parseElement(element: AuditElement = {}): AuditProperties {
    return Task.parseElement(element) as AuditProperties;
  }

  isActive() {
    return isActive(this.status);
  }

  isRunning() {
    return this.status === AUDIT_STATUS.running;
  }

  isQueued() {
    return this.status === AUDIT_STATUS.queued;
  }

  isStopped() {
    return this.status === AUDIT_STATUS.stopped;
  }

  isInterrupted() {
    return this.status === AUDIT_STATUS.interrupted;
  }

  isNew() {
    return this.status === AUDIT_STATUS.new;
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
}

export default Audit;

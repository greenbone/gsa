/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {parseFilter} from 'gmp/collection/parser';
import {type Date} from 'gmp/models/date';
import Filter, {type FilterKeyword} from 'gmp/models/filter';
import Model, {type ModelElement, type ModelProperties} from 'gmp/models/model';
import {type ReportResultCountElement} from 'gmp/models/report/parser';
import ReportTask from 'gmp/models/report/task';
import {type TaskStatus} from 'gmp/models/task';
import {parseSeverity, parseDate, type YesNo} from 'gmp/parser';
import {isDefined} from 'gmp/utils/identity';

export type ReportType = 'scan' | 'assets' | 'delta';

interface ReportFiltersElement {
  _id?: string;
  filter?: string[];
  keywords?: {
    keyword?: FilterKeyword | FilterKeyword[];
  };
  term?: string;
}

interface ReportDeltaElement {
  report?: {
    _id?: string;
    scan_end?: string; // date
    scan_run_status?: string;
    scan_start?: string; // date
    timestamp?: string; // date
  };
}

export interface ReportReportTaskElement {
  _id?: string;
  comment?: string;
  name?: string;
  progress?: number;
  target?: {
    _id?: string;
    comment?: string;
    name?: string;
    trash?: YesNo;
  };
  agent_group?: {
    _id?: string;
  };
  oci_image_target?: {
    _id?: string;
  };
}

export interface ReportReportElement extends ModelElement {
  _type?: ReportType;
  delta?: ReportDeltaElement;
  filters?: ReportFiltersElement;
  gmp?: {
    version?: string;
  };
  hosts?: {count?: number};
  result_count?: ReportResultCountElement;
  scan_end?: string;
  scan_start?: string;
  scan_run_status?: string;
  severity?: {
    filtered?: number;
    full?: number;
  };
  sort?: {
    field?: {
      __text?: string;
      order?: 'descending' | 'ascending';
    };
  };
  task?: ReportReportTaskElement;
  timestamp?: string;
  timezone?: string;
  timezone_abbrev?: string;
}

export interface DeltaReport {
  id?: string;
  scan_run_status?: TaskStatus;
  scan_start?: Date;
  scan_end?: Date;
  timestamp?: Date;
}

interface ReportReportSeverity {
  filtered?: number;
  full?: number;
}

interface ReportResultCounts {
  filtered?: number;
  full?: number;
  critical?: {
    filtered?: number;
    full?: number;
  };
  high?: {
    filtered?: number;
    full?: number;
  };
  medium?: {
    filtered?: number;
    full?: number;
  };
  low?: {
    filtered?: number;
    full?: number;
  };
  log?: {
    filtered?: number;
    full?: number;
  };
  false_positive?: {
    filtered?: number;
    full?: number;
  };
}

interface ReportReportProperties extends ModelProperties {
  delta_report?: DeltaReport;
  filter?: Filter;
  report_type?: ReportType;
  result_count?: ReportResultCounts;
  scan_end?: Date;
  scan_run_status?: TaskStatus;
  scan_start?: Date;
  severity?: ReportReportSeverity;
  task?: ReportTask;
  timezone?: string;
  timezone_abbrev?: string;
}

class ReportReport extends Model {
  static readonly entityType = 'report';

  readonly delta_report?: DeltaReport;
  readonly filter?: Filter;
  readonly report_type?: ReportType;
  readonly result_count?: ReportResultCounts;
  readonly scan_end?: Date;
  readonly scan_run_status?: TaskStatus;
  readonly scan_start?: Date;
  readonly severity?: ReportReportSeverity;
  readonly task?: ReportTask;
  readonly timezone?: string;
  readonly timezone_abbrev?: string;

  constructor({
    // eslint-disable-next-line @typescript-eslint/naming-convention
    delta_report,
    filter,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    report_type,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    result_count,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    scan_end,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    scan_run_status,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    scan_start,
    severity,
    task,
    timezone,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    timezone_abbrev,
    ...properties
  }: ReportReportProperties = {}) {
    super(properties);

    this.delta_report = delta_report;
    this.filter = filter;
    this.report_type = report_type;
    this.result_count = result_count;
    this.scan_end = scan_end;
    this.scan_run_status = scan_run_status;
    this.scan_start = scan_start;
    this.severity = severity;
    this.task = task;
    this.timezone = timezone;
    this.timezone_abbrev = timezone_abbrev;
  }

  static fromElement(element?: ReportReportElement): ReportReport {
    return new ReportReport(this.parseElement(element));
  }

  static parseElement(
    element: ReportReportElement = {},
  ): ReportReportProperties {
    const copy = super.parseElement(element) as ReportReportProperties;

    const {delta, severity, scan_start, scan_end, task} = element;

    const filter = isDefined(element.filters)
      ? parseFilter(element)
      : new Filter();
    copy.filter = filter;

    copy.report_type = element._type;

    copy.severity = isDefined(severity)
      ? {
          filtered: parseSeverity(severity.filtered),
          full: parseSeverity(severity.full),
        }
      : undefined;

    copy.task = ReportTask.fromElement(task);

    copy.scan_start = parseDate(scan_start);
    copy.scan_end = parseDate(scan_end);
    copy.scan_run_status = element.scan_run_status as TaskStatus;
    copy.timezone = element.timezone;
    copy.timezone_abbrev = element.timezone_abbrev;

    if (isDefined(delta?.report)) {
      copy.delta_report = {
        id: delta.report._id,
        scan_run_status: delta.report.scan_run_status as TaskStatus,
        scan_end: parseDate(delta.report.scan_end),
        scan_start: parseDate(delta.report.scan_start),
        timestamp: parseDate(delta.report.timestamp),
      };
    }

    if (isDefined(element.result_count)) {
      copy.result_count = {
        filtered: element.result_count.filtered,
        full: element.result_count.full,
        critical: {
          filtered: element.result_count.critical?.filtered,
          full: element.result_count.critical?.full,
        },
        false_positive: {
          filtered: element.result_count.false_positive?.filtered,
          full: element.result_count.false_positive?.full,
        },
        high: {
          filtered: element.result_count.high?.filtered,
          full: element.result_count.high?.full,
        },
        log: {
          filtered: element.result_count.log?.filtered,
          full: element.result_count.log?.full,
        },
        low: {
          filtered: element.result_count.low?.filtered,
          full: element.result_count.low?.full,
        },
        medium: {
          filtered: element.result_count.medium?.filtered,
          full: element.result_count.medium?.full,
        },
      };
    }

    return copy;
  }

  isDeltaReport() {
    return this.report_type === 'delta';
  }
}

export default ReportReport;

/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {CollectionList, parseFilter} from 'gmp/collection/parser';
import {Date} from 'gmp/models/date';
import Filter from 'gmp/models/filter';
import Model, {ModelElement, ModelProperties} from 'gmp/models/model';
import ReportApp from 'gmp/models/report/app';
import ReportCve from 'gmp/models/report/cve';
import ReportHost from 'gmp/models/report/host';
import ReportOperatingSystem from 'gmp/models/report/os';
import {
  parseApps,
  parseClosedCves,
  parseCves,
  parseErrors,
  parseHosts,
  parseOperatingSystems,
  parsePorts,
  parseResults,
  parseTlsCertificates,
  ReportResultsElement,
  CountElement,
  TlsCertificatesElement,
  ReportResultCountElement,
  PortsElement,
  ReportHostElement,
  ErrorsElement,
  ReportError,
  ReportClosedCve,
} from 'gmp/models/report/parser';
import ReportPort from 'gmp/models/report/port';
import ReportTask from 'gmp/models/report/task';
import ReportTLSCertificate from 'gmp/models/report/tlscertificate';
import Result from 'gmp/models/result';
import {parseSeverity, parseDate, YesNo} from 'gmp/parser';
import {isDefined} from 'gmp/utils/identity';

export type ReportType = 'scan' | 'assets' | 'delta';

export interface ReportReportElement extends ModelElement {
  _type?: ReportType;
  apps?: CountElement;
  closed_cves?: CountElement;
  delta?: {
    report?: {
      _id?: string;
      scan_end?: string; // date
      scan_run_status?: string;
      scan_start?: string; // date
      timestamp?: string; // date
    };
  };
  errors?: ErrorsElement;
  filters?: {
    _id?: string;
    filter?: string[];
    keywords?: {
      keyword?: {
        column?: string;
        relation?: string;
        value?: string | number;
      };
    };
    term?: string;
  };
  gmp?: {
    version?: string;
  };
  host?: ReportHostElement | ReportHostElement[];
  hosts?: CountElement;
  ports?: PortsElement;
  os?: CountElement;
  result_count?: ReportResultCountElement;
  results?: ReportResultsElement; // only present if details=1
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
  ssl_certs?: CountElement;
  task?: {
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
  };
  timestamp?: string;
  timezone?: string;
  timezone_abbrev?: string;
  tls_certificates?: TlsCertificatesElement;
  vulns?: CountElement;
}

interface DeltaReport {
  id?: string;
  scan_run_status?: string;
  scan_start?: Date;
  scan_end?: Date;
  timestamp?: Date;
}

interface ReportReportSeverity {
  filtered?: number;
  full?: number;
}

interface ReportReportProperties extends ModelProperties {
  applications?: CollectionList<ReportApp>;
  closedCves?: CollectionList<ReportClosedCve>;
  cves?: CollectionList<ReportCve>;
  delta_report?: DeltaReport;
  errors?: CollectionList<ReportError>;
  filter?: Filter;
  hosts?: CollectionList<ReportHost>;
  operatingsystems?: CollectionList<ReportOperatingSystem>;
  ports?: CollectionList<ReportPort>;
  report_type?: ReportType;
  results?: CollectionList<Result>;
  scan_end?: Date;
  scan_start?: Date;
  severity?: ReportReportSeverity;
  task?: ReportTask;
  tlsCertificates?: CollectionList<ReportTLSCertificate>;
}

class ReportReport extends Model {
  static readonly entityType = 'report';

  readonly applications?: CollectionList<ReportApp>;
  readonly closedCves?: CollectionList<ReportClosedCve>;
  readonly cves?: CollectionList<ReportCve>;
  readonly delta_report?: DeltaReport;
  readonly errors?: CollectionList<ReportError>;
  readonly filter?: Filter;
  readonly hosts?: CollectionList<ReportHost>;
  readonly operatingsystems?: CollectionList<ReportOperatingSystem>;
  readonly ports?: CollectionList<ReportPort>;
  readonly report_type?: ReportType;
  readonly results?: CollectionList<Result>;
  readonly scan_end?: Date;
  readonly scan_start?: Date;
  readonly severity?: ReportReportSeverity;
  readonly task?: ReportTask;
  readonly tlsCertificates?: CollectionList<ReportTLSCertificate>;

  constructor({
    applications,
    closedCves,
    cves,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    delta_report,
    errors,
    filter,
    hosts,
    operatingsystems,
    ports,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    report_type,
    results,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    scan_end,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    scan_start,
    severity,
    task,
    tlsCertificates,
    ...properties
  }: ReportReportProperties = {}) {
    super(properties);

    this.applications = applications;
    this.closedCves = closedCves;
    this.cves = cves;
    this.delta_report = delta_report;
    this.errors = errors;
    this.filter = filter;
    this.hosts = hosts;
    this.operatingsystems = operatingsystems;
    this.ports = ports;
    this.report_type = report_type;
    this.results = results;
    this.scan_end = scan_end;
    this.scan_start = scan_start;
    this.severity = severity;
    this.task = task;
    this.tlsCertificates = tlsCertificates;
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

    copy.results = parseResults(element);
    copy.hosts = parseHosts(element, filter);
    copy.tlsCertificates = parseTlsCertificates(element, filter);
    copy.applications = parseApps(element, filter);
    copy.operatingsystems = parseOperatingSystems(element, filter);
    copy.ports = parsePorts(element, filter);
    copy.cves = parseCves(element, filter);
    copy.closedCves = parseClosedCves(element, filter);
    copy.errors = parseErrors(element, filter);

    copy.scan_start = parseDate(scan_start);
    copy.scan_end = parseDate(scan_end);

    if (isDefined(delta?.report)) {
      copy.delta_report = {
        id: delta.report._id,
        scan_run_status: delta.report.scan_run_status,
        scan_end: parseDate(delta.report.scan_end),
        scan_start: parseDate(delta.report.scan_start),
        timestamp: parseDate(delta.report.timestamp),
      };
    }

    return copy;
  }

  isDeltaReport() {
    return this.report_type === 'delta';
  }
}

export default ReportReport;

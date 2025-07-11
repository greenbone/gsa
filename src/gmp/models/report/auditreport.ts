/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {CollectionList, parseFilter} from 'gmp/collection/parser';
import {AuditStatus} from 'gmp/models/audit';
import {ComplianceType} from 'gmp/models/compliance';
import {Date} from 'gmp/models/date';
import Filter from 'gmp/models/filter';
import Model, {ModelProperties} from 'gmp/models/model';
import ReportHost from 'gmp/models/report/host';
import ReportOperatingSystem from 'gmp/models/report/os';
import {
  parseErrors,
  parseHosts,
  parseOperatingSystems,
  parseResults,
  parseTlsCertificates,
  ReportComplianceCountElement,
  ReportError,
} from 'gmp/models/report/parser';
import {
  DeltaReport,
  ReportReportElement,
  ReportType,
} from 'gmp/models/report/report';
import ReportTask from 'gmp/models/report/task';
import ReportTLSCertificate from 'gmp/models/report/tlscertificate';
import Result from 'gmp/models/result';
import {parseDate, parseInt} from 'gmp/parser';
import {isDefined} from 'gmp/utils/identity';

interface AuditReportReportElement extends ReportReportElement {
  compliance?: {
    filtered?: ComplianceType;
    full?: ComplianceType;
  };
  compliance_count?: ReportComplianceCountElement;
}

interface AuditReportCompliance {
  filtered?: ComplianceType;
  full?: ComplianceType;
}

export interface AuditReportComplianceCounts {
  full?: number;
  filtered?: number;
  yes?: {
    full?: number;
    filtered?: number;
  };
  no?: {
    full?: number;
    filtered?: number;
  };
  incomplete?: {
    full?: number;
    filtered?: number;
  };
  undefined?: {
    full?: number;
    filtered?: number;
  };
}

interface AuditReportReportProperties extends ModelProperties {
  compliance?: AuditReportCompliance;
  complianceCounts?: AuditReportComplianceCounts;
  delta_report?: DeltaReport;
  errors?: CollectionList<ReportError>;
  filter?: Filter;
  hosts?: CollectionList<ReportHost>;
  operatingSystems?: CollectionList<ReportOperatingSystem>;
  reportType?: ReportType;
  results?: CollectionList<Result>;
  task?: ReportTask;
  scan_end?: Date;
  scan_run_status?: AuditStatus;
  scan_start?: Date;
  timezone?: string;
  timezone_abbrev?: string;
  tlsCertificates?: CollectionList<ReportTLSCertificate>;
}

class AuditReportReport extends Model {
  static readonly entityType = 'auditreport';

  readonly compliance?: AuditReportCompliance;
  readonly complianceCounts?: AuditReportComplianceCounts;
  readonly delta_report?: DeltaReport;
  readonly errors?: CollectionList<ReportError>;
  readonly filter?: Filter;
  readonly hosts?: CollectionList<ReportHost>;
  readonly operatingSystems?: CollectionList<ReportOperatingSystem>;
  readonly reportType?: ReportType;
  readonly results?: CollectionList<Result>;
  readonly task?: ReportTask;
  readonly scan_end?: Date;
  readonly scan_run_status?: string;
  readonly scan_start?: Date;
  readonly timezone?: string;
  readonly timezone_abbrev?: string;
  readonly tlsCertificates?: CollectionList<ReportTLSCertificate>;

  constructor({
    compliance,
    complianceCounts,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    delta_report,
    errors,
    filter,
    hosts,
    operatingSystems,
    reportType,
    results,
    task,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    scan_end,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    scan_run_status,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    scan_start,
    timezone,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    timezone_abbrev,
    tlsCertificates,
    ...properties
  }: AuditReportReportProperties = {}) {
    super(properties);

    this.compliance = compliance;
    this.complianceCounts = complianceCounts;
    this.delta_report = delta_report;
    this.errors = errors;
    this.filter = filter;
    this.hosts = hosts;
    this.operatingSystems = operatingSystems;
    this.reportType = reportType;
    this.results = results;
    this.task = task;
    this.scan_end = scan_end;
    this.scan_run_status = scan_run_status;
    this.scan_start = scan_start;
    this.timezone = timezone;
    this.timezone_abbrev = timezone_abbrev;
    this.tlsCertificates = tlsCertificates;
  }

  static fromElement(element?: AuditReportReportElement): AuditReportReport {
    return new AuditReportReport(this.parseElement(element));
  }

  static parseElement(
    element: AuditReportReportElement = {},
  ): AuditReportReportProperties {
    const copy = super.parseElement(element) as AuditReportReportProperties;

    const {delta, compliance, compliance_count, scan_start, scan_end, task} =
      element;

    const filter = parseFilter(element);

    copy.filter = filter;

    copy.reportType = element._type;

    if (isDefined(compliance)) {
      copy.compliance = {
        filtered: compliance.filtered,
        full: compliance.full,
      };
    }

    if (isDefined(compliance_count)) {
      copy.complianceCounts = {
        filtered: parseInt(compliance_count.filtered),
        full: parseInt(compliance_count.full),
        incomplete: {
          filtered: parseInt(compliance_count.incomplete?.filtered),
          full: parseInt(compliance_count.incomplete?.full),
        },
        no: {
          filtered: parseInt(compliance_count.no?.filtered),
          full: parseInt(compliance_count.no?.full),
        },
        undefined: {
          filtered: parseInt(compliance_count.undefined?.filtered),
          full: parseInt(compliance_count.undefined?.full),
        },
        yes: {
          filtered: parseInt(compliance_count.yes?.filtered),
          full: parseInt(compliance_count.yes?.full),
        },
      };
    }

    copy.task = ReportTask.fromElement(task);
    copy.results = parseResults(element);
    copy.hosts = parseHosts(element, filter);
    copy.tlsCertificates = parseTlsCertificates(element, filter);
    copy.operatingSystems = parseOperatingSystems(element, filter);
    copy.errors = parseErrors(element, filter);

    copy.scan_start = parseDate(scan_start);
    copy.scan_end = parseDate(scan_end);
    copy.scan_run_status = element.scan_run_status as AuditStatus;

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
    return this.reportType === 'delta';
  }
}

export default AuditReportReport;

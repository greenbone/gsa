/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {isDefined} from 'gmp/utils/identity';
import {isEmpty} from 'gmp/utils/string';

import {parseDate} from 'gmp/parser';

import {parseFilter} from 'gmp/collection/parser';

import Model from 'gmp/model';

import ReportTask from './task';

import {
  parse_errors,
  parseHosts,
  parseOperatingSystems,
  parseResults,
  parseTlsCertificates,
} from './parser';

class AuditReportReport extends Model {
  static entityType = 'auditreport';

  parseProperties(element) {
    return AuditReportReport.parseElement(element);
  }

  static parseElement(element) {
    const copy = super.parseElement(element);

    const {
      delta,
      compliance,
      compliance_count,
      scan_start,
      scan_end,
      task,
      scan,
      timestamp,
    } = element;

    const filter = parseFilter(element);

    copy.filter = filter;

    copy.reportType = element._type;

    delete copy.filters;

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
          filtered: parseInt(compliance_count.incomplete.filtered),
          full: parseInt(compliance_count.incomplete.full),
        },
        no: {
          filtered: parseInt(compliance_count.no.filtered),
          full: parseInt(compliance_count.no.full),
        },
        undefined: {
          filtered: parseInt(compliance_count.undefined.filtered),
          full: parseInt(compliance_count.undefined.full),
        },
        yes: {
          filtered: parseInt(compliance_count.yes.filtered),
          full: parseInt(compliance_count.yes.full),
        },
      };
    }

    delete copy.compliance_count;

    copy.task = ReportTask.fromElement(task);

    copy.results = parseResults(element, filter);

    copy.hosts = parseHosts(element, filter);

    copy.tlsCertificates = parseTlsCertificates(element, filter);

    delete copy.host;

    copy.operatingSystems = parseOperatingSystems(element, filter);

    copy.errors = parse_errors(element, filter);

    copy.scan_start = parseDate(scan_start);

    if (isDefined(scan_end)) {
      copy.scan_end = parseDate(scan_end);
    }

    if (isDefined(timestamp)) {
      copy.timestamp = parseDate(timestamp);
    }

    if (isDefined(scan) && isDefined(scan.task) && isDefined(scan.task.slave)) {
      if (isEmpty(scan.task.slave._id)) {
        delete copy.scan.task.slave;
      } else {
        copy.slave = {
          ...scan.task.slave,
        };
      }
    }

    if (isDefined(delta) && isDefined(delta.report)) {
      copy.delta_report = {
        id: delta.report._id,
        scan_run_status: delta.report.scan_run_status,
        scan_end: parseDate(delta.report.scan_end),
        scan_start: parseDate(delta.report.scan_start),
        timestamp: parseDate(delta.report.timestamp),
      };

      delete copy.delta;
    }

    return copy;
  }

  isDeltaReport() {
    return this.reportType === 'delta';
  }
}

export default AuditReportReport;

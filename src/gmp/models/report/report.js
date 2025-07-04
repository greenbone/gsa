/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {parseFilter} from 'gmp/collection/parser';
import Model from 'gmp/models/model';
import {
  parseApps,
  parseClosedCves,
  parseCves,
  parse_errors,
  parseHosts,
  parseOperatingSystems,
  parsePorts,
  parseResults,
  parseTlsCertificates,
} from 'gmp/models/report/parser';
import ReportTask from 'gmp/models/report/task';
import {parseSeverity, parseDate} from 'gmp/parser';
import {isDefined} from 'gmp/utils/identity';
import {isEmpty} from 'gmp/utils/string';

class ReportReport extends Model {
  static entityType = 'report';

  parseProperties(element) {
    return ReportReport.parseElement(element);
  }

  static parseElement(element) {
    const copy = super.parseElement(element);

    const {delta, severity, scan_start, scan_end, task, scan, timestamp} =
      element;

    const filter = parseFilter(element);

    copy.filter = filter;

    copy.report_type = element._type;

    delete copy.filters;

    if (isDefined(severity)) {
      copy.severity = {
        filtered: parseSeverity(severity.filtered),
        full: parseSeverity(severity.full),
      };
    }

    copy.severity_class = Model.fromElement(copy.severity_class);

    copy.task = ReportTask.fromElement(task);

    copy.results = parseResults(element, filter);

    copy.hosts = parseHosts(element, filter);

    copy.tlsCertificates = parseTlsCertificates(element, filter);

    delete copy.host;

    copy.applications = parseApps(element, filter);

    copy.operatingsystems = parseOperatingSystems(element, filter);

    copy.ports = parsePorts(element, filter);

    copy.cves = parseCves(element, filter);

    copy.closedCves = parseClosedCves(element, filter);

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
    return this.report_type === 'delta';
  }
}

export default ReportReport;

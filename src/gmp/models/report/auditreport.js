/* Copyright (C) 2024 Greenbone AG
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
import {isDefined} from '../../utils/identity';
import {isEmpty} from '../../utils/string';

import {parseDate} from '../../parser';

import {parseFilter} from '../../collection/parser';

import Model from '../../model';

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

    const {delta, compliance, scan_start, scan_end, task, scan, timestamp} =
      element;

    const filter = parseFilter(element);

    copy.filter = filter;

    copy.report_type = element._type;

    delete copy.filters;

    if (isDefined(compliance)) {
      copy.compliance = {
        filtered: compliance.filtered,
        full: compliance.full,
      };
    }

    copy.task = ReportTask.fromElement(task);

    copy.results = parseResults(element, filter);

    copy.hosts = parseHosts(element, filter);

    copy.tlsCertificates = parseTlsCertificates(element, filter);

    delete copy.host;

    copy.operatingsystems = parseOperatingSystems(element, filter);

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

export default AuditReportReport;

// vim: set ts=2 sw=2 tw=80:
/* Copyright (C) 2016-2019 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 */
import {isDefined} from '../../utils/identity';
import {isEmpty} from '../../utils/string';

import {parseSeverity, parseDate} from '../../parser';

import {parseFilter} from '../../collection/parser';

import Model from '../../model';

import ReportTask from './task';

import {
  parse_apps,
  parse_closed_cves,
  parse_cves,
  parse_errors,
  parse_hosts,
  parse_operatingsystems,
  parse_ports,
  parse_results,
  parse_tls_certificates,
  parse_vulnerabilities,
} from './parser';

class ReportReport extends Model {
  static entityType = 'report';

  parseProperties(elem) {
    const copy = super.parseProperties(elem);

    const {delta, severity, scan_start, scan_end, task, scan, timestamp} = elem;

    const filter = parseFilter(elem);

    copy.filter = filter;

    copy.report_type = elem._type;

    delete copy.filters;

    if (isDefined(severity)) {
      copy.severity = {
        filtered: parseSeverity(severity.filtered),
        full: parseSeverity(severity.full),
      };
    }

    copy.severity_class = new Model(copy.severity_class);

    copy.task = new ReportTask(task, 'task');

    copy.results = parse_results(elem, filter);

    copy.hosts = parse_hosts(elem, filter);

    copy.tls_certificates = parse_tls_certificates(elem, filter);

    delete copy.host;

    copy.applications = parse_apps(elem, filter);

    copy.vulnerabilities = parse_vulnerabilities(elem, filter);

    copy.operatingsystems = parse_operatingsystems(elem, filter);

    copy.ports = parse_ports(elem, filter);

    copy.cves = parse_cves(elem, filter);

    copy.closed_cves = parse_closed_cves(elem, filter);

    copy.errors = parse_errors(elem, filter);

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

// vim: set ts=2 sw=2 tw=80:

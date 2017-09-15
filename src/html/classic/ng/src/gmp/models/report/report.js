/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2016 - 2017 Greenbone Networks GmbH
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

import moment from 'moment';

import {is_defined, is_empty} from '../../utils.js';

import {parse_severity} from '../../parser.js';

import {parse_filter} from '../../collection/parser.js';

import Model from '../../model.js';

import ReportTask from './task.js';

import {
  parse_apps,
  parse_hosts,
  parse_operatingsystems,
  parse_results,
  parse_vulnerabilities,
} from './parser.js';

class ReportReport extends Model {

  static entity_type = 'report';

  parseProperties(elem) {
    const copy = super.parseProperties(elem);

    const {severity, scan_start, scan_end, task, scan} = elem;

    const filter = parse_filter(elem);

    copy.filter = filter;

    delete copy.filters;

    copy.severity = {
      filtered: parse_severity(severity.filtered),
      full: parse_severity(severity.full),
    };

    copy.severity_class = new Model(copy.severity_class);

    copy.task = new ReportTask(task, 'task');

    copy.results = parse_results(elem, filter);

    copy.hosts = parse_hosts(elem, filter);

    delete copy.host;

    copy.applications = parse_apps(elem, filter);

    copy.vulnerabilities = parse_vulnerabilities(elem, filter);

    copy.operatingsystems = parse_operatingsystems(elem, filter);

    copy.scan_start = moment(scan_start);

    if (is_defined(scan_end)) {
      copy.scan_end = moment(scan_end);
    }

    if (is_defined(scan) && is_defined(scan.task) &&
      is_defined(scan.task.slave)) {

      if (is_empty(scan.task.slave._id)) {
        delete copy.scan.task.slave;
      }
      else {
        copy.slave = {
          ...scan.task.slave,
        };
      }
    }

    return copy;
  }
}

export default ReportReport;

// vim: set ts=2 sw=2 tw=80:

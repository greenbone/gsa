/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2016 - 2018 Greenbone Networks GmbH
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
import {is_defined} from '../utils/identity';

import {parse_severity, parseDate} from '../parser';

import Model from '../model';

import ReportReport from './report/report';

// FIXME the report xml structure is really ugly

class Report extends Model {

  static entity_type = 'report';

  parseProperties(elem) {
    const copy = super.parseProperties(elem);

    const {
      report,
      report_format,
      severity,
      _type: type,
      _content_type: content_type,
      task,
      scan_start,
      scan_end,
      timestamp,
    } = elem;

    if (is_defined(report)) {
      copy.report = new ReportReport(report);
    }

    copy.report_format = new Model(report_format, 'report_format');
    copy.task = new Model(task, 'task');

    if (is_defined(severity)) {
      copy.severity = parse_severity(severity);
    }

    copy.report_type = type;
    copy.content_type = content_type;

    copy.scan_start = parseDate(scan_start);
    copy.timestamp = parseDate(timestamp);

    if (is_defined(scan_end)) {
      copy.scan_end = parseDate(scan_end);
    }

    return copy;
  }
}

export default Report;

// vim: set ts=2 sw=2 tw=80:

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
import {isDefined} from '../utils/identity';

import {parseSeverity, parseDate} from '../parser';

import Model from '../model';

import ReportReport from './report/report';

// FIXME the report xml structure is really ugly

class Report extends Model {
  static entityType = 'report';

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

    if (isDefined(report)) {
      copy.report = new ReportReport(report);
    }

    copy.report_format = new Model(report_format, 'reportformat');
    copy.task = new Model(task, 'task');

    if (isDefined(severity)) {
      copy.severity = parseSeverity(severity);
    }

    copy.report_type = type;
    copy.content_type = content_type;

    copy.scan_start = parseDate(scan_start);
    copy.timestamp = parseDate(timestamp);

    if (isDefined(scan_end)) {
      copy.scan_end = parseDate(scan_end);
    }

    return copy;
  }
}

export default Report;

// vim: set ts=2 sw=2 tw=80:

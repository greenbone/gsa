/* Copyright (C) 2016-2021 Greenbone Networks GmbH
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
import {isDefined} from 'gmp/utils/identity';

import {parseSeverity, parseDate} from 'gmp/parser';

import Model, {parseModelFromElement} from 'gmp/model';

import ReportReport from './report/report';
import Task from './task';

// FIXME the report xml structure is really ugly

class Report extends Model {
  static entityType = 'report';

  static parseElement(element) {
    const copy = super.parseElement(element);

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
    } = element;

    if (isDefined(report)) {
      copy.report = ReportReport.fromElement(report);
    }

    copy.report_format = parseModelFromElement(report_format, 'reportformat');
    copy.task = parseModelFromElement(task, 'task');

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

  static parseObject(object) {
    const copy = super.parseObject(object);

    const {
      report,
      report_format,
      severity,
      task,
      scanStart,
      scanEnd,
      timestamp,
    } = object;

    if (isDefined(report)) {
      copy.report = ReportReport.fromElement(report);
    }

    copy.reportFormat = parseModelFromElement(report_format, 'reportformat');
    copy.task = Task.fromObject(task);

    if (isDefined(severity)) {
      copy.severity = parseSeverity(severity);
    }

    copy.scanStart = parseDate(scanStart);

    copy.timestamp = parseDate(timestamp);

    if (isDefined(scanEnd)) {
      copy.scanEnd = parseDate(scanEnd);
    }

    return copy;
  }
}

export default Report;

// vim: set ts=2 sw=2 tw=80:

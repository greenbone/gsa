/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Model, {parseModelFromElement} from 'gmp/model';
import {parseSeverity, parseDate} from 'gmp/parser';
import {isDefined} from 'gmp/utils/identity';

import ReportReport from './report/report';

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
}

export default Report;

// vim: set ts=2 sw=2 tw=80:

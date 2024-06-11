/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {_l} from 'gmp/locale/lang';

import {isDefined} from 'gmp/utils/identity';

import {parseDate} from 'gmp/parser';

import Model, {parseModelFromElement} from 'gmp/model';

import AuditReportReport from './report/auditreport';

export const COMPLIANCE_STATES = {
  yes: _l('Yes'),
  no: _l('No'),
  incomplete: _l('Incomplete'),
  undefined: _l('Undefined'),
};
/* eslint-disable quote-props */

export const getTranslatableReportCompliance = compliance =>
  `${COMPLIANCE_STATES[compliance]}`;

class AuditReport extends Model {
  static entityType = 'auditreport';

  static parseElement(element) {
    const copy = super.parseElement(element);

    const {
      report,
      report_format,
      _type: type,
      _content_type: content_type,
      task,
      scan_start,
      scan_end,
      timestamp,
    } = element;

    if (isDefined(report)) {
      copy.report = AuditReportReport.fromElement(report);
    }

    copy.reportFormat = parseModelFromElement(report_format, 'reportformat');
    copy.task = parseModelFromElement(task, 'task');

    copy.reportType = type;
    copy.contentType = content_type; // revert ?

    copy.scan_start = parseDate(scan_start);
    copy.timestamp = parseDate(timestamp);

    if (isDefined(scan_end)) {
      copy.scan_end = parseDate(scan_end);
    }

    return copy;
  }
}

export default AuditReport;

// vim: set ts=2 sw=2 tw=80:

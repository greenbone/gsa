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
import {_l} from 'gmp/locale/lang';

import {isDefined} from 'gmp/utils/identity';

import {parseDate} from 'gmp/parser';

import Model, {parseModelFromElement} from 'gmp/model';

import AuditReportReport from './report/auditreport';

const COMPLIANCE_STATE_TRANSLATIONS = {
  yes: _l('Yes'),
  no: _l('No'),
  incomplete: _l('Incomplete'),
  undefined: _l('Undefined'),
};
/* eslint-disable quote-props */

export const getTranslatableReportCompliance = compliance =>
  `${COMPLIANCE_STATE_TRANSLATIONS[compliance]}`;

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

    copy.report_format = parseModelFromElement(report_format, 'reportformat');
    copy.task = parseModelFromElement(task, 'task');

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

export default AuditReport;

// vim: set ts=2 sw=2 tw=80:

/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Model, {ModelProperties} from 'gmp/models/model';
import {ReportElement} from 'gmp/models/report';
import AuditReportReport from 'gmp/models/report/auditreport';
import {isDefined} from 'gmp/utils/identity';

type AuditReportElement = ReportElement;

interface AuditReportProperties extends ModelProperties {
  contentType?: string;
  report?: AuditReportReport;
  reportFormat?: Model;
  reportType?: string;
  task?: Model;
}

class AuditReport extends Model {
  static readonly entityType = 'auditreport';

  readonly contentType?: string;
  readonly report?: AuditReportReport;
  readonly reportFormat?: Model;
  readonly reportType?: string;
  readonly task?: Model;

  constructor({
    contentType,
    report,
    reportFormat,
    reportType,
    task,
    ...properties
  }: AuditReportProperties = {}) {
    super(properties);

    this.contentType = contentType;
    this.report = report;
    this.reportFormat = reportFormat;
    this.reportType = reportType;
    this.task = task;
  }

  static fromElement(element?: AuditReportElement): AuditReport {
    return new AuditReport(this.parseElement(element));
  }

  static parseElement(element: AuditReportElement = {}): AuditReportProperties {
    const copy = super.parseElement(element) as AuditReportProperties;

    const {
      report,
      report_format,
      _type: type,
      _content_type: content_type,
      task,
    } = element;

    copy.report = isDefined(report)
      ? AuditReportReport.fromElement(report)
      : undefined;
    copy.reportFormat = isDefined(report_format)
      ? Model.fromElement(report_format, 'reportformat')
      : undefined;
    copy.task = isDefined(task) ? Model.fromElement(task, 'task') : undefined;

    copy.reportType = type;
    copy.contentType = content_type;

    return copy;
  }
}

export default AuditReport;

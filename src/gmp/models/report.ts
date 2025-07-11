/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Model, {ModelElement, ModelProperties} from 'gmp/models/model';
import ReportReport, {
  ReportReportElement,
  ReportType,
} from 'gmp/models/report/report';
import {isDefined} from 'gmp/utils/identity';

export interface ReportElement extends ModelElement {
  _config_id?: string;
  _content_type?: string;
  _extension?: string;
  _format_id?: string;
  _type?: ReportType;
  report?: ReportReportElement;
  report_config?: {
    _id?: string;
    name?: string;
  };
  report_format?: {
    _id?: string;
    name?: string;
  };
  task?: {
    name?: string;
    _id?: string;
  };
}

interface ReportProperties extends ModelProperties {
  content_type?: string;
  report?: ReportReport;
  report_config?: Model;
  report_format?: Model;
  report_type?: ReportType;
  task?: Model;
}

class Report extends Model {
  static readonly entityType = 'report';

  readonly content_type?: string;
  readonly report?: ReportReport;
  readonly report_config?: Model;
  readonly report_format?: Model;
  readonly report_type?: ReportType;
  readonly task?: Model;

  constructor({
    // eslint-disable-next-line @typescript-eslint/naming-convention
    content_type,
    report,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    report_config,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    report_format,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    report_type,
    task,
    ...properties
  }: ReportProperties = {}) {
    super(properties);

    this.content_type = content_type;
    this.report = report;
    this.report_config = report_config;
    this.report_format = report_format;
    this.report_type = report_type;
    this.task = task;
  }

  static fromElement(element: ReportElement = {}): Report {
    return new Report(this.parseElement(element));
  }

  static parseElement(element: ReportElement = {}): ReportProperties {
    const copy = super.parseElement(element) as ReportProperties;

    const {
      report,
      report_config,
      report_format,
      _type: type,
      _content_type: content_type,
      task,
    } = element;

    copy.report = isDefined(report)
      ? ReportReport.fromElement(report)
      : undefined;
    copy.report_format = isDefined(report_format)
      ? Model.fromElement(report_format, 'reportformat')
      : undefined;
    copy.report_config = isDefined(report_config)
      ? Model.fromElement(report_config, 'reportconfig')
      : undefined;
    copy.task = isDefined(task) ? Model.fromElement(task, 'task') : undefined;

    copy.report_type = type;
    copy.content_type = content_type;

    return copy;
  }
}

export default Report;

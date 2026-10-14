/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import BaseModel, {
  type BaseModelElement,
  type BaseModelProperties,
} from 'gmp/models/base-model';
import {type Date as GmpDate} from 'gmp/models/date';
import {type Owner, parseEntityModelProperties} from 'gmp/models/entity-model';
import {parseDate, parseInt, parseToString} from 'gmp/parser';

const STATUSES = [
  'pending',
  'running',
  'done',
  'error',
  'cancel_requested',
  'canceled',
  'expired',
] as const;

const PROGRESSES = ['queued', 'preparing', 'generating', 'completed'] as const;

const REPORT_TYPES = ['scan', 'audit', 'delta_scan', 'delta_audit'] as const;

export type ReportExportStatus = (typeof STATUSES)[number] | 'unknown';
export type ReportExportProgress = (typeof PROGRESSES)[number];
export type ReportExportType = (typeof REPORT_TYPES)[number] | 'unknown';

interface IdElement {
  _id?: string;
}

export interface ReportExportElement extends BaseModelElement {
  _id: string;
  attempt_count?: string | number;
  content_type?: string;
  delta_report?: IdElement;
  end_time?: string;
  error_message?: string;
  extension?: string;
  file_size?: string | number;
  name?: string;
  owner?: Owner;
  progress?: string;
  report_config?: IdElement;
  report_format?: IdElement;
  report?: IdElement;
  start_time?: string;
  status?: string;
}

export interface ReportExportProperties extends BaseModelProperties {
  attemptCount?: number;
  contentType?: string;
  deltaReportId?: string;
  endTime?: GmpDate;
  errorMessage?: string;
  extension?: string;
  fileSize?: number;
  id: string;
  name?: string;
  owner?: Owner;
  progress?: ReportExportProgress;
  reportConfigId?: string;
  reportFormatId?: string;
  reportId?: string;
  startTime?: GmpDate;
  status: ReportExportStatus;
  type: ReportExportType;
}

const includes = <T extends string>(
  values: readonly T[],
  value?: string,
): value is T => values.includes(value as T);

class ReportExport extends BaseModel {
  readonly attemptCount?: number;
  readonly contentType?: string;
  readonly deltaReportId?: string;
  readonly endTime?: GmpDate;
  readonly errorMessage?: string;
  readonly extension?: string;
  readonly fileSize?: number;
  readonly id: string;
  readonly name?: string;
  readonly owner?: Owner;
  readonly progress?: ReportExportProgress;
  readonly reportConfigId?: string;
  readonly reportFormatId?: string;
  readonly reportId?: string;
  readonly startTime?: GmpDate;
  readonly status: ReportExportStatus;
  readonly type: ReportExportType;

  constructor({
    creationTime,
    modificationTime,
    _type,
    attemptCount,
    contentType,
    deltaReportId,
    endTime,
    errorMessage,
    extension,
    fileSize,
    id,
    name,
    type,
    owner,
    progress,
    reportConfigId,
    reportFormatId,
    reportId,
    startTime,
    status,
  }: ReportExportProperties) {
    super({creationTime, modificationTime, _type});

    this.id = id;
    this.type = type;
    this.owner = owner;
    this.name = name;
    this.attemptCount = attemptCount;
    this.contentType = contentType;
    this.deltaReportId = deltaReportId;
    this.endTime = endTime;
    this.errorMessage = errorMessage;
    this.extension = extension;
    this.fileSize = fileSize;
    this.progress = progress;
    this.reportConfigId = reportConfigId;
    this.reportFormatId = reportFormatId;
    this.reportId = reportId;
    this.startTime = startTime;
    this.status = status;
  }

  static fromElement(element: ReportExportElement): ReportExport {
    return new ReportExport(this.parseElement(element));
  }

  static parseElement(element: ReportExportElement): ReportExportProperties {
    const {id, owner, name, creationTime, modificationTime, _type} =
      parseEntityModelProperties(element);
    const status = parseToString(element.status);
    const progress = parseToString(element.progress);
    return {
      id,
      owner,
      name,
      creationTime,
      modificationTime,
      status: includes(STATUSES, status) ? status : 'unknown',
      progress: includes(PROGRESSES, progress) ? progress : undefined,
      reportId: parseToString(element.report?._id),
      deltaReportId: parseToString(element.delta_report?._id),
      reportFormatId: parseToString(element.report_format?._id),
      reportConfigId: parseToString(element.report_config?._id),
      fileSize: parseInt(element.file_size),
      contentType: parseToString(element.content_type),
      extension: parseToString(element.extension),
      errorMessage: parseToString(element.error_message),
      attemptCount: parseInt(element.attempt_count),
      startTime: parseDate(element.start_time),
      endTime: parseDate(element.end_time),
      type: includes(REPORT_TYPES, _type) ? _type : 'unknown',
    };
  }
}

export default ReportExport;

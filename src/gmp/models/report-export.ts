/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {
  type EntityModelElement,
  type EntityModelProperties,
  parseEntityModelProperties,
} from 'gmp/models/entity-model';
import {parseInt, parseText, parseToString, type TextElement} from 'gmp/parser';
import {isDefined} from 'gmp/utils/identity';

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

export type ReportExportStatus = (typeof STATUSES)[number] | 'unknown';
export type ReportExportProgress = (typeof PROGRESSES)[number];

interface IdElement {
  _id?: string;
}

type TextValue = string | number | TextElement;

export interface ReportExportElement extends Partial<
  Pick<
    EntityModelElement,
    '_id' | 'owner' | 'name' | 'creation_time' | 'modification_time'
  >
> {
  type?: TextValue;
  status?: TextValue;
  progress?: TextValue;
  report?: IdElement;
  delta_report?: IdElement;
  report_format?: IdElement;
  report_config?: IdElement;
  file_size?: TextValue;
  content_type?: TextValue;
  extension?: TextValue;
  error_message?: TextValue;
  attempt_count?: TextValue;
  start_time?: TextValue;
  end_time?: TextValue;
}

export interface ReportExport extends Pick<
  EntityModelProperties,
  'owner' | 'name' | 'creationTime' | 'modificationTime'
> {
  id: string;
  type?: string;
  status: ReportExportStatus;
  progress?: ReportExportProgress;
  reportId?: string;
  deltaReportId?: string;
  reportFormatId?: string;
  reportConfigId?: string;
  fileSize?: number;
  contentType?: string;
  extension?: string;
  errorMessage?: string;
  attemptCount?: number;
  startTime?: string;
  endTime?: string;
}

const includes = <T extends string>(
  values: readonly T[],
  value?: string,
): value is T => values.includes(value as T);

const number = (value?: TextValue) => {
  const parsed = parseText(value);
  return isDefined(parsed) ? parseInt(parsed) : undefined;
};

export const parseReportExport = (
  element: ReportExportElement,
): ReportExport | undefined => {
  const id = parseToString(element._id);
  if (!id) return undefined;
  const {owner, name, creationTime, modificationTime} =
    parseEntityModelProperties({
      _id: id,
      owner: element.owner,
      name: element.name,
      creation_time: element.creation_time,
      modification_time: element.modification_time,
    });
  const status = parseText(element.status);
  const progress = parseText(element.progress);
  return {
    id,
    owner,
    name,
    creationTime,
    modificationTime,
    type: parseText(element.type),
    status: includes(STATUSES, status) ? status : 'unknown',
    progress: includes(PROGRESSES, progress) ? progress : undefined,
    reportId: parseToString(element.report?._id),
    deltaReportId: parseToString(element.delta_report?._id),
    reportFormatId: parseToString(element.report_format?._id),
    reportConfigId: parseToString(element.report_config?._id),
    fileSize: number(element.file_size),
    contentType: parseText(element.content_type),
    extension: parseText(element.extension),
    errorMessage: parseText(element.error_message),
    attemptCount: number(element.attempt_count),
    startTime: parseText(element.start_time),
    endTime: parseText(element.end_time),
  };
};

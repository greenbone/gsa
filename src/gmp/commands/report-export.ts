/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import CollectionCounts from 'gmp/collection/collection-counts';
import {parseCounts, parseFilter} from 'gmp/collection/parser';
import HttpCommand from 'gmp/commands/http';
import type Http from 'gmp/http/http';
import {type default as Response} from 'gmp/http/response';
import {type XmlMeta, type XmlResponseData} from 'gmp/http/transform/fast-xml';
import {parseEntityModelProperties} from 'gmp/models/entity-model';
import {type FilterType} from 'gmp/models/filter';
import {filterString} from 'gmp/models/filter/utils';
import {type ReportExport} from 'gmp/models/report-export';
import {isDefined} from 'gmp/utils/identity';

export interface ReportExportPayload {
  report_id: string;
  format_id: string;
  config_id?: string;
  filter?: FilterType | string;
  filter_id?: string;
  delta_report_id?: string;
  ignore_pagination?: boolean | number;
  lean?: boolean | number;
}

interface ReportExportIdResponse {
  id: string;
}

interface ReportExportParams {
  reportExportId: string;
}

interface ListReportExportsParams {
  filter: FilterType;
}

const getText = (value: unknown): string | undefined => {
  if (typeof value === 'string' || typeof value === 'number') {
    return String(value);
  }
  if (value && typeof value === 'object' && '__text' in value) {
    return getText(value.__text);
  }
  return undefined;
};

const getAttribute = (value: unknown, name: string) => {
  if (value && typeof value === 'object') {
    const attribute = (value as Record<string, unknown>)[`_${name}`];
    return getText(attribute);
  }
  return undefined;
};

const getValue = (value: unknown, name: string) => {
  if (value && typeof value === 'object') {
    return getText((value as Record<string, unknown>)[name]);
  }
  return undefined;
};

const getNumber = (value: unknown, name: string) => {
  const text = getValue(value, name);
  return isDefined(text) ? Number(text) : undefined;
};

const getReportExport = (value: unknown): ReportExport => {
  const ownerName = getValue(
    value && (value as Record<string, unknown>).owner,
    'name',
  );
  const common = parseEntityModelProperties({
    _id: getAttribute(value, 'id') ?? getValue(value, 'id') ?? '',
    owner: ownerName ? {name: ownerName} : undefined,
    name: getValue(value, 'name'),
    creation_time: getValue(value, 'creation_time'),
    modification_time: getValue(value, 'modification_time'),
  });
  return {
    id: common.id || undefined,
    owner: common.owner,
    name: common.name,
    creationTime: common.creationTime,
    modificationTime: common.modificationTime,
    type: getValue(value, 'type'),
    status: getValue(value, 'status'),
    progress: getValue(value, 'progress'),
    reportId: getAttribute(
      value && (value as Record<string, unknown>).report,
      'id',
    ),
    deltaReportId: getAttribute(
      value && (value as Record<string, unknown>).delta_report,
      'id',
    ),
    reportFormatId: getAttribute(
      value && (value as Record<string, unknown>).report_format,
      'id',
    ),
    reportConfigId: getAttribute(
      value && (value as Record<string, unknown>).report_config,
      'id',
    ),
    fileSize: getNumber(value, 'file_size'),
    contentType: getValue(value, 'content_type'),
    extension: getValue(value, 'extension'),
    errorMessage: getValue(value, 'error_message'),
    attemptCount: getNumber(value, 'attempt_count'),
    createdTime: getValue(value, 'creation_time'),
    startTime: getValue(value, 'start_time'),
    endTime: getValue(value, 'end_time'),
  };
};

const getFilterValue = (filter?: FilterType | string) => {
  if (!isDefined(filter)) return undefined;
  return typeof filter === 'string' ? filter : filterString(filter.all());
};

const getReportExportsFromRoot = (data: XmlResponseData): unknown[] => {
  const exports = data.get_report_export ?? data.get_report_exports;
  const root =
    exports && typeof exports === 'object'
      ? (exports as Record<string, unknown>).get_report_exports_response
      : undefined;
  const response =
    root && typeof root === 'object'
      ? (root as Record<string, unknown>)
      : undefined;
  if (!response?.report_export) return [];
  return Array.isArray(response.report_export)
    ? response.report_export
    : [response.report_export];
};

class ReportExportCommand extends HttpCommand {
  constructor(http: Http) {
    super(http);
  }

  private create(command: string, payload: ReportExportPayload) {
    const {filter, ...params} = payload;
    return this.httpPostWithTransform({
      cmd: command,
      ...params,
      filter: getFilterValue(filter),
    });
  }

  private transformCreateResponse(
    response: Response<XmlResponseData, XmlMeta>,
  ): Response<ReportExportIdResponse, XmlMeta> {
    const data = response.data as Record<string, unknown>;
    const responseIds = [
      'export_scan_report',
      'export_audit_report',
      'export_delta_scan_report',
      'export_delta_audit_report',
    ].map(command => {
      const commandData = data[command];
      if (!commandData || typeof commandData !== 'object') return undefined;
      const responseData = (commandData as Record<string, unknown>)[
        `${command}_response`
      ];
      return getAttribute(responseData, 'id');
    });
    const reportExportId =
      getValue(data.action_result, 'report_export_id') ??
      getValue(data, 'report_export_id') ??
      responseIds.find(isDefined);
    if (!reportExportId) {
      throw new Error('Invalid response: report_export_id not found');
    }
    return response.setData({id: reportExportId});
  }

  exportScanReport(payload: ReportExportPayload) {
    return this.create('export_scan_report', payload).then(response =>
      this.transformCreateResponse(response),
    );
  }

  exportAuditReport(payload: ReportExportPayload) {
    return this.create('export_audit_report', payload).then(response =>
      this.transformCreateResponse(response),
    );
  }

  exportDeltaScanReport(payload: ReportExportPayload) {
    return this.create('export_delta_scan_report', payload).then(response =>
      this.transformCreateResponse(response),
    );
  }

  exportDeltaAuditReport(payload: ReportExportPayload) {
    return this.create('export_delta_audit_report', payload).then(response =>
      this.transformCreateResponse(response),
    );
  }

  async getReportExport({reportExportId}: ReportExportParams) {
    const response = await this.httpGetWithTransform({
      cmd: 'get_report_export',
      report_export_id: reportExportId,
    });
    return response.setData(
      getReportExportsFromRoot(response.data).map(getReportExport),
    );
  }

  async getReportExports({filter}: ListReportExportsParams) {
    const response = await this.httpGetWithTransform({
      cmd: 'get_report_exports',
      filter: filterString(filter),
    });
    const root = response.data.get_report_exports;
    if (
      !root ||
      typeof root !== 'object' ||
      !('get_report_exports_response' in root)
    ) {
      throw new Error('Invalid report export collection response');
    }
    const collection = root.get_report_exports_response;
    if (!collection || typeof collection !== 'object') {
      throw new Error('Invalid report export collection response');
    }
    return response.set(
      getReportExportsFromRoot(response.data).map(getReportExport),
      {
        counts: new CollectionCounts(parseCounts(collection, 'report_export')),
        filter: parseFilter(collection),
      },
    );
  }

  downloadReportExport({reportExportId}: ReportExportParams) {
    return this.httpRequestWithRejectionTransform<ArrayBuffer>('get', {
      args: {
        cmd: 'download_report_export',
        report_export_id: reportExportId,
      },
      responseType: 'arraybuffer',
    });
  }

  cancelReportExport({reportExportId}: ReportExportParams) {
    return this.httpPostWithTransform({
      cmd: 'cancel_report_export',
      report_export_id: reportExportId,
    });
  }
}

export default ReportExportCommand;

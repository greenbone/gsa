/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import CollectionCounts from 'gmp/collection/collection-counts';
import {parseCounts, parseFilter} from 'gmp/collection/parser';
import HttpCommand from 'gmp/commands/http';
import type Http from 'gmp/http/http';
import {type XmlResponseData} from 'gmp/http/transform/fast-xml';
import {type FilterType} from 'gmp/models/filter';
import {filterString} from 'gmp/models/filter/utils';
import {
  parseReportExport,
  type ReportExport,
  type ReportExportElement,
} from 'gmp/models/report-export';
import {map} from 'gmp/utils/array';

export interface ReportExportPayload {
  report_id: string;
  format_id: string;
  config_id?: string;
  filter?: FilterType;
  filter_id?: string;
  delta_report_id?: string;
  ignore_pagination?: boolean | number;
  lean?: boolean | number;
}

type ExportCommand =
  | 'export_scan_report'
  | 'export_audit_report'
  | 'export_delta_scan_report'
  | 'export_delta_audit_report';

interface ReportExportIdResponse {
  id: string;
}

interface ReportExportParams {
  reportExportId: string;
}

interface ListReportExportsParams {
  filter: FilterType;
}

interface ReportExportsResponseElement extends Pick<
  Parameters<typeof parseFilter>[0],
  'filters'
> {
  report_export?: ReportExportElement | ReportExportElement[];
}

type CreateResponseData = XmlResponseData &
  Partial<Record<ExportCommand, Record<string, {_id?: string} | undefined>>>;

interface GetReportExportResponseData extends XmlResponseData {
  get_report_export?: {
    get_report_exports_response?: ReportExportsResponseElement;
  };
}

interface GetReportExportsResponseData extends XmlResponseData {
  get_report_exports?: {
    get_report_exports_response?: ReportExportsResponseElement;
  };
}

const parseReportExports = (element?: ReportExportsResponseElement) =>
  map(element?.report_export, parseReportExport).filter(
    (item): item is ReportExport => item !== undefined,
  );

class ReportExportCommand extends HttpCommand {
  constructor(http: Http) {
    super(http);
  }

  private async create(command: ExportCommand, payload: ReportExportPayload) {
    const {filter, ...params} = payload;
    const response = await this.httpPostWithTransform({
      cmd: command,
      ...params,
      filter: filter ? filterString(filter.all()) : undefined,
    });
    // gvmd answers with this id for both newly created and reused exports
    const id = (response.data as CreateResponseData)[command]?.[
      `${command}_response`
    ]?._id;
    if (!id) {
      throw new Error('Invalid response: report_export_id not found');
    }
    return response.setData<ReportExportIdResponse>({id});
  }

  exportScanReport(payload: ReportExportPayload) {
    return this.create('export_scan_report', payload);
  }

  exportAuditReport(payload: ReportExportPayload) {
    return this.create('export_audit_report', payload);
  }

  exportDeltaScanReport(payload: ReportExportPayload) {
    return this.create('export_delta_scan_report', payload);
  }

  exportDeltaAuditReport(payload: ReportExportPayload) {
    return this.create('export_delta_audit_report', payload);
  }

  async getReportExport({reportExportId}: ReportExportParams) {
    const response = await this.httpGetWithTransform({
      cmd: 'get_report_export',
      report_export_id: reportExportId,
    });
    const data = response.data as GetReportExportResponseData;
    return response.setData(
      parseReportExports(data.get_report_export?.get_report_exports_response),
    );
  }

  async getReportExports({filter}: ListReportExportsParams) {
    const response = await this.httpGetWithTransform({
      cmd: 'get_report_exports',
      filter: filterString(filter),
    });
    const collection = (response.data as GetReportExportsResponseData)
      .get_report_exports?.get_report_exports_response;
    if (!collection) {
      throw new Error('Invalid report export collection response');
    }
    return response.set(parseReportExports(collection), {
      counts: new CollectionCounts(parseCounts(collection, 'report_export')),
      filter: parseFilter(collection),
    });
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

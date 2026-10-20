/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import HttpCommand from 'gmp/commands/http';
import type Http from 'gmp/http/http';
import {type XmlResponseData} from 'gmp/http/transform/fast-xml';
import logger from 'gmp/log';
import {type FilterType} from 'gmp/models/filter';
import ReportExport, {type ReportExportElement} from 'gmp/models/report-export';
import {parseYesNo} from 'gmp/parser';
import {isDefined} from 'gmp/utils/identity';

export interface ReportExportPayload {
  deltaReportId?: string;
  filter?: FilterType;
  filterId?: string;
  ignorePagination?: boolean;
  lean?: boolean;
  reportFormatId: string;
  reportId: string;
  reportConfigId?: string;
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

type CreateResponseData = XmlResponseData &
  Partial<Record<ExportCommand, Record<string, {_id?: string} | undefined>>>;

interface ReportExportResponseElement {
  report_export?: ReportExportElement;
}
interface GetReportExportResponseData extends XmlResponseData {
  get_report_export?: {
    get_report_exports_response?: ReportExportResponseElement;
  };
}

const log = logger.getLogger('gmp.commands.report-export');

const CONTENT_REGEX = /<content>([\s\S]*?)<\/content>/;

// gsad answers a download either with the raw file bytes or with the GMP
// XML document carrying the file base64 encoded in <content>. Normalize to
// raw file bytes.
const decodeReportExportFile = (data: ArrayBuffer): ArrayBuffer => {
  const text = new TextDecoder().decode(data);
  const match = CONTENT_REGEX.exec(text);
  if (!match) {
    return data;
  }
  try {
    const binary = atob(match[1].replace(/\s+/g, ''));
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index++) {
      bytes[index] = binary.charCodeAt(index);
    }
    return bytes.buffer;
  } catch {
    throw new Error('Invalid base64 file content in the download response');
  }
};

class ReportExportCommand extends HttpCommand {
  constructor(http: Http) {
    super(http);
  }

  private getIdFromCreateRootElement(
    command: ExportCommand,
    data: CreateResponseData,
  ) {
    return data[command]?.[`${command}_response`]?._id;
  }

  private async create(
    command: ExportCommand,
    {
      filter,
      reportId,
      reportFormatId,
      reportConfigId,
      filterId,
      deltaReportId,
      ignorePagination,
      lean,
    }: ReportExportPayload,
  ) {
    const response = await this.httpPostWithTransform({
      report_id: reportId,
      format_id: reportFormatId,
      config_id: reportConfigId,
      filter_id: filterId,
      delta_report_id: deltaReportId,
      ignore_pagination: isDefined(ignorePagination)
        ? parseYesNo(ignorePagination)
        : undefined,
      lean: isDefined(lean) ? parseYesNo(lean) : undefined,
      cmd: command,
      filter: isDefined(filter) ? filter.all() : undefined,
    });
    // gvmd answers with this id for both newly created and reused exports
    const id = this.getIdFromCreateRootElement(command, response.data);
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

  async get({reportExportId}: ReportExportParams) {
    const response = await this.httpGetWithTransform({
      cmd: 'get_report_export',
      report_export_id: reportExportId,
    });
    const data = response.data as GetReportExportResponseData;
    const reportExportElement =
      data.get_report_export?.get_report_exports_response?.report_export;
    let entity = isDefined(reportExportElement)
      ? ReportExport.fromElement(reportExportElement)
      : undefined;
    if (!isDefined(entity?.id)) {
      log.warn('ReportExport with undefined id found.'); // should never happen and gsad MUST return a 404 if the report export does not exist or has not id
      // @ts-ignore
      entity = undefined;
    }
    return response.setData(entity);
  }

  async downloadReportExport({reportExportId}: ReportExportParams) {
    const response = await this.httpRequestWithRejectionTransform<ArrayBuffer>(
      'get',
      {
        args: {
          cmd: 'download_report_export',
          report_export_id: reportExportId,
        },
        responseType: 'arraybuffer',
      },
    );
    return response.setData(decodeReportExportFile(response.data));
  }

  cancelReportExport({reportExportId}: ReportExportParams) {
    return this.httpPostWithTransform({
      cmd: 'cancel_report_export',
      report_export_id: reportExportId,
    });
  }
}

export default ReportExportCommand;

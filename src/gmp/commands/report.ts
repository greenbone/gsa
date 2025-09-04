/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {convertBoolean} from 'gmp/commands/convert';
import EntityCommand from 'gmp/commands/entity';
import GmpHttp from 'gmp/http/gmp';
import DefaultTransform from 'gmp/http/transform/default';
import {XmlResponseData} from 'gmp/http/transform/fastxml';
import logger from 'gmp/log';
import Filter, {ALL_FILTER} from 'gmp/models/filter';
import Report, {ReportElement} from 'gmp/models/report';
import {YesNo} from 'gmp/parser';
import {isDefined} from 'gmp/utils/identity';

interface ReportCommandImportParams {
  task_id: string;
  in_assets?: YesNo;
  xml_file?: string;
}

interface ReportCommandAddAssetsParams {
  id: string;
  filter?: string;
}

interface ReportCommandARemoveAssetsParams {
  id: string;
  filter?: string;
}

interface ReportCommandAlertParams {
  alert_id: string;
  report_id: string;
  filter: string;
}

interface ReportCommandGetParams {
  id?: string;
  filter?: string;
  details?: boolean;
  ignorePagination?: boolean;
  lean?: boolean;
  options?: Record<string, unknown>;
}

interface ReportCommandDownloadParams {
  id: string;
}

interface ReportCommandDownloadOptions {
  reportFormatId: string;
  reportConfigId: string;
  deltaReportId?: string;
  filter?: Filter;
}

const log = logger.getLogger('gmp.commands.reports');

class ReportCommand extends EntityCommand<Report, ReportElement> {
  constructor(http: GmpHttp) {
    super(http, 'report', Report);
  }

  import(args: ReportCommandImportParams) {
    const {task_id, in_assets = 1, xml_file} = args;
    log.debug('Creating report', args);
    return this.httpPost({
      cmd: 'create_report',
      task_id,
      in_assets,
      xml_file,
    });
  }

  download(
    {id}: ReportCommandDownloadParams,
    {
      reportFormatId,
      reportConfigId,
      deltaReportId,
      filter,
    }: ReportCommandDownloadOptions,
  ) {
    return this.httpGet(
      {
        cmd: 'get_report',
        delta_report_id: deltaReportId,
        details: 1,
        report_id: id,
        report_config_id: reportConfigId,
        report_format_id: reportFormatId,
        filter: isDefined(filter) ? filter.all() : ALL_FILTER,
      },
      // @ts-expect-error
      {transform: DefaultTransform, responseType: 'arraybuffer'},
    );
  }

  addAssets({id, filter = ''}: ReportCommandAddAssetsParams) {
    return this.httpPost({
      cmd: 'create_asset',
      report_id: id,
      filter,
    });
  }

  removeAssets({id, filter = ''}: ReportCommandARemoveAssetsParams) {
    return this.httpPost({
      cmd: 'delete_asset',
      report_id: id,
      filter,
    });
  }

  // eslint-disable-next-line @typescript-eslint/naming-convention
  alert({alert_id, report_id, filter}: ReportCommandAlertParams) {
    return this.httpPost({
      cmd: 'report_alert',
      alert_id,
      report_id,
      filter,
    });
  }

  async getDelta(
    {id}: {id: string},
    // eslint-disable-next-line @typescript-eslint/naming-convention
    {id: delta_report_id}: {id: string},
    {
      filter,
      details = true,
      ...options
    }: {filter?: string; details?: boolean; [key: string]: unknown} = {},
  ) {
    const response = await this.httpGet(
      {
        id,
        delta_report_id,
        filter,
        ignore_pagination: 1,
        details: convertBoolean(details),
      },
      options,
    );
    return this.transformResponse(response);
  }

  async get(
    {id, ...params}: ReportCommandGetParams,
    {
      filter,
      details = true,
      ignorePagination = true,
      lean = true,
      ...options
    }: ReportCommandGetParams = {},
  ) {
    const response = await this.httpGet({
      id,
      filter,
      lean: convertBoolean(lean),
      ignore_pagination: convertBoolean(ignorePagination),
      details: convertBoolean(details),
      ...options,
      ...params,
    });
    return this.transformResponse(response);
  }

  getElementFromRoot(root: XmlResponseData): ReportElement {
    // @ts-expect-error
    return root.get_report.get_reports_response.report;
  }
}

export default ReportCommand;

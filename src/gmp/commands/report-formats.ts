/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import EntitiesCommand from 'gmp/commands/entities';
import type Http from 'gmp/http/http';
import {type XmlResponseData} from 'gmp/http/transform/fast-xml';
import type {Element} from 'gmp/models/model';
import ReportFormat from 'gmp/models/report-format';

interface ReportFormatsResponseData extends XmlResponseData {
  get_report_formats?: {
    get_report_formats_response?: Element;
  };
}

export class ReportFormatsCommand extends EntitiesCommand<ReportFormat> {
  constructor(http: Http) {
    super(http, 'report_format', ReportFormat);
  }

  getEntitiesResponse(root: XmlResponseData) {
    return (
      (root as ReportFormatsResponseData).get_report_formats
        ?.get_report_formats_response ?? {}
    );
  }
}

export default ReportFormatsCommand;

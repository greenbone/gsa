/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import EntitiesCommand from 'gmp/commands/entities';
import type Http from 'gmp/http/http';
import {type XmlResponseData} from 'gmp/http/transform/fast-xml';
import type {Element} from 'gmp/models/model';
import ReportConfig from 'gmp/models/report-config';

interface ReportConfigsResponseData extends XmlResponseData {
  get_report_configs?: {
    get_report_configs_response?: Element;
  };
}

export class ReportConfigsCommand extends EntitiesCommand<ReportConfig> {
  constructor(http: Http) {
    super(http, 'report_config', ReportConfig);
  }

  getEntitiesResponse(root: XmlResponseData) {
    return (
      (root as ReportConfigsResponseData).get_report_configs
        ?.get_report_configs_response ?? {}
    );
  }
}

export default ReportConfigsCommand;

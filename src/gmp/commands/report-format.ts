/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import EntityCommand from 'gmp/commands/entity';
import type Http from 'gmp/http/http';
import {type XmlResponseData} from 'gmp/http/transform/fast-xml';
import logger from 'gmp/log';
import type {Element} from 'gmp/models/model';
import ReportFormat from 'gmp/models/report-format';

interface ReportFormatResponseData extends XmlResponseData {
  get_report_format?: {
    get_report_formats_response?: {
      report_format?: Element;
    };
  };
}

const log = logger.getLogger('gmp.commands.reportformats');

export class ReportFormatCommand extends EntityCommand<ReportFormat> {
  constructor(http: Http) {
    super(http, 'report_format', ReportFormat);
  }

  import({xmlFile}: {xmlFile: string}) {
    const data = {
      cmd: 'import_report_format',
      xml_file: xmlFile,
    };
    log.debug('Importing report format', data);
    return this.action(data);
  }

  save(args: {active: boolean; id: string; name: string; summary: string}) {
    const {active, id, name, summary} = args;

    const data = {
      cmd: 'save_report_format',
      enable: active,
      id,
      name,
      summary,
    };

    log.debug('Saving report format', args, data);
    return this.action(data);
  }

  getElementFromRoot(root: XmlResponseData) {
    return (
      (root as ReportFormatResponseData).get_report_format
        ?.get_report_formats_response?.report_format ?? {}
    );
  }
}

export default ReportFormatCommand;

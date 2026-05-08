/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import EntityCommand from 'gmp/commands/entity';
import type Http from 'gmp/http/http';
import {type XmlResponseData} from 'gmp/http/transform/fast-xml';
import logger from 'gmp/log';
import type {Element} from 'gmp/models/model';
import ReportConfig from 'gmp/models/report-config';
import {parseYesNo} from 'gmp/parser';
import {isArray} from 'gmp/utils/identity';

type ReportConfigParamValue =
  | string
  | number
  | boolean
  | Array<string | number | boolean>;

interface ReportConfigCreateArgs {
  comment?: string;
  name: string;
  reportFormatId: string;
  params?: Record<string, ReportConfigParamValue>;
  paramsUsingDefault?: Record<string, string | number | boolean | undefined>;
  paramTypes?: Record<string, string>;
}

interface ReportConfigSaveArgs {
  id: string;
  comment?: string;
  name: string;
  params?: Record<string, ReportConfigParamValue>;
  paramsUsingDefault?: Record<string, string | number | boolean | undefined>;
  paramTypes?: Record<string, string>;
}

interface ReportConfigResponseData extends XmlResponseData {
  get_report_config?: {
    get_report_configs_response?: {
      report_config?: Element;
    };
  };
}

const log = logger.getLogger('gmp.commands.reportconfigs');

export class ReportConfigCommand extends EntityCommand<ReportConfig> {
  constructor(http: Http) {
    super(http, 'report_config', ReportConfig);
  }

  create(args: ReportConfigCreateArgs) {
    const {
      comment,
      name,
      reportFormatId,
      params = {},
      paramsUsingDefault = {},
      paramTypes = {},
    } = args;

    const data = {
      cmd: 'create_report_config',
      name,
      comment,
      report_format_id: reportFormatId,
    };

    for (const prefName in params) {
      let value = params[prefName];
      if (isArray(value)) {
        if (paramTypes[prefName] === 'report_format_list') {
          value = value.map(String).join(',');
        } else {
          value = JSON.stringify(value);
        }
      }
      data['param:' + prefName] = value;
    }

    for (const param_name in paramsUsingDefault) {
      if (paramsUsingDefault[param_name]) {
        data['param_using_default:' + param_name] = parseYesNo(
          paramsUsingDefault[param_name],
        );
      }
    }

    log.debug('Creating new report config', args);
    return this.action(data);
  }

  save(args: ReportConfigSaveArgs) {
    const {
      id,
      comment,
      name,
      params = {},
      paramsUsingDefault = {},
      paramTypes = {},
    } = args;

    const data = {
      cmd: 'save_report_config',
      id,
      name,
      comment,
    };

    for (const paramName in paramsUsingDefault) {
      if (paramsUsingDefault[paramName]) {
        data['param_using_default:' + paramName] = parseYesNo(
          paramsUsingDefault[paramName],
        );
      }
    }

    for (const prefName in params) {
      let value = params[prefName];
      if (isArray(value)) {
        if (paramTypes[prefName] === 'report_format_list') {
          value = value.map(String).join(',');
        } else {
          value = JSON.stringify(value);
        }
      }
      data['param:' + prefName] = value;
    }

    log.debug('Saving report config', args, data);
    return this.action(data);
  }

  getElementFromRoot(root: XmlResponseData) {
    return (
      (root as ReportConfigResponseData).get_report_config
        ?.get_report_configs_response?.report_config ?? {}
    );
  }
}

export default ReportConfigCommand;

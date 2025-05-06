/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import registerCommand from 'gmp/command';
import {convertBoolean} from 'gmp/commands/convert';
import EntitiesCommand from 'gmp/commands/entities';
import EntityCommand from 'gmp/commands/entity';
import logger from 'gmp/log';
import ReportConfig from 'gmp/models/reportconfig';
import {isArray} from 'gmp/utils/identity';

const log = logger.getLogger('gmp.commands.reportconfigs');

export class ReportConfigCommand extends EntityCommand {
  constructor(http) {
    super(http, 'report_config', ReportConfig);
  }

  create(args) {
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
          value = params[prefName].join(',');
        } else {
          value = JSON.stringify(params[prefName]);
        }
      }
      data['param:' + prefName] = value;
    }

    for (const param_name in paramsUsingDefault) {
      if (paramsUsingDefault[param_name]) {
        data['param_using_default:' + param_name] = convertBoolean(
          paramsUsingDefault[param_name],
        );
      }
    }

    log.debug('Creating new report config', args);
    return this.action(data);
  }

  save(args) {
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
        data['param_using_default:' + paramName] = convertBoolean(
          paramsUsingDefault[paramName],
        );
      }
    }

    for (const prefName in params) {
      let value = params[prefName];
      if (isArray(params[prefName])) {
        if (paramTypes[prefName] === 'report_format_list') {
          value = params[prefName].join(',');
        } else {
          value = JSON.stringify(params[prefName]);
        }
      }
      data['param:' + prefName] = value;
    }

    log.debug('Saving report config', args, data);
    return this.action(data);
  }

  getElementFromRoot(root) {
    return root.get_report_config.get_report_configs_response.report_config;
  }
}

export class ReportConfigsCommand extends EntitiesCommand {
  constructor(http) {
    super(http, 'report_config', ReportConfig);
  }

  getEntitiesResponse(root) {
    return root.get_report_configs.get_report_configs_response;
  }
}

registerCommand('reportconfig', ReportConfigCommand);
registerCommand('reportconfigs', ReportConfigsCommand);

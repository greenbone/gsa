/* Copyright (C) 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
import logger from 'gmp/log';

import registerCommand from 'gmp/command';

import ReportConfig from 'gmp/models/reportconfig';

import {isArray} from 'gmp/utils/identity';

import EntitiesCommand from './entities';
import EntityCommand from './entity';
import {convertBoolean} from 'gmp/commands/convert';

const log = logger.getLogger('gmp.commands.reportconfigs');

export class ReportConfigCommand extends EntityCommand {
  constructor(http) {
    super(http, 'report_config', ReportConfig);
  }

  create(args) {
    const {
      comment,
      name,
      report_format_id,
      params = {},
      params_using_default = {},
      param_types = {},
    } = args;

    const data = {
      cmd: 'create_report_config',
      name,
      comment,
      report_format_id,
    };

    for (const prefname in params) {
      let value = params[prefname];
      if (isArray(value)) {
        if (param_types[prefname] === 'report_format_list') {
          value = params[prefname].join(',');
        } else {
          value = JSON.stringify(params[prefname]);
        }
      }
      data['param:' + prefname] = value;
    }

    for (const param_name in params_using_default) {
      if (params_using_default[param_name]) {
        data['param_using_default:' + param_name] = convertBoolean(
          params_using_default[param_name],
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
      params_using_default = {},
      param_types = {},
    } = args;

    const data = {
      cmd: 'save_report_config',
      id,
      name,
      comment,
    };

    for (const param_name in params_using_default) {
      if (params_using_default[param_name]) {
        data['param_using_default:' + param_name] = convertBoolean(
          params_using_default[param_name],
        );
      }
    }

    for (const prefname in params) {
      let value = params[prefname];
      if (isArray(params[prefname])) {
        if (param_types[prefname] === 'report_format_list') {
          value = params[prefname].join(',');
        } else {
          value = JSON.stringify(params[prefname]);
        }
      }
      data['param:' + prefname] = value;
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

// vim: set ts=2 sw=2 tw=80:

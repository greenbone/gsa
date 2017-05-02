/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2017 Greenbone Networks GmbH
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 */

import logger from '../../log.js';

import {EntitiesCommand, EntityCommand, register_command} from '../command.js';

import ScanConfig from '../models/scanconfig.js';

const log = logger.getLogger('gmp.commands.scanconfigs');

export class ScanConfigCommand extends EntityCommand {

  constructor(http) {
    super(http, 'config', ScanConfig);
  }

  import({xml_file}) {
    const data = {
      cmd: 'import_config',
      next: 'get_config',
      xml_file,
    };
    log.debug('Importing scan config', data);
    return this.httpPost(data);
  }

  create({
    base,
    name,
    comment,
    scanner_id,
  }) {
    const data = {
      cmd: 'create_config',
      next: 'get_config',
      base,
      comment,
      name,
      scanner_id,
    };
    return this.httpPost(data).then(this.transformResponse);
  }

  getElementFromRoot(root) {
    return root.get_config_response.get_configs_response.config;
  }

}

export class ScanConfigsCommand extends EntitiesCommand {

  constructor(http) {
    super(http, 'config', ScanConfig);
  }

  getEntitiesResponse(root) {
    return root.get_configs.get_configs_response;
  }
}

register_command('scanconfig', ScanConfigCommand);
register_command('scanconfigs', ScanConfigsCommand);

// vim: set ts=2 sw=2 tw=80:

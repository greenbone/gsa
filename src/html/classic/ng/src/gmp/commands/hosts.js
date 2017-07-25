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

import logger from '../log.js';

import {EntitiesCommand, EntityCommand, register_command} from '../command.js';

import Host from '../models/host.js';

const log = logger.getLogger('gmp.commands.hosts');

class HostCommand extends EntityCommand {

  constructor(http) {
    super(http, 'asset', Host);
    this.setParam('asset_type', 'host');
  }

  create(args) {
    let {name, comment = ''} = args;
    log.debug('Creating host', args);
    return this.httpPost({
      cmd: 'create_host',
      name,
      comment,
    });
  }

  save(args) {
    let {id, comment = ''} = args;
    log.debug('Saving host', args);
    return this.httpPost({
      cmd: 'save_asset',
      asset_id: id,
      comment,
    });
  }

  getElementFromRoot(root) {
    return root.get_asset.get_assets_response.asset;
  }
}

class HostsCommand extends EntitiesCommand {

  constructor(http) {
    super(http, 'asset', Host);
    this.setParam('asset_type', 'host');
  }

  getEntitiesResponse(root) {
    return root.get_assets.get_assets_response;
  }
}

register_command('host', HostCommand);
register_command('hosts', HostsCommand);

// vim: set ts=2 sw=2 tw=80:

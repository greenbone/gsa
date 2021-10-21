/* Copyright (C) 2017-2021 Greenbone Networks GmbH
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

import Host from 'gmp/models/host';

import EntitiesCommand from './entities';
import EntityCommand from './entity';

const log = logger.getLogger('gmp.commands.hosts');

class HostCommand extends EntityCommand {
  constructor(http) {
    super(http, 'asset', Host);
    this.setDefaultParam('asset_type', 'host');
  }

  create(args) {
    const {name, comment = ''} = args;
    log.debug('Creating host', args);
    return this.action({
      cmd: 'create_host',
      name,
      comment,
    });
  }

  save(args) {
    const {id, comment = ''} = args;
    log.debug('Saving host', args);
    return this.action({
      cmd: 'save_asset',
      asset_id: id,
      comment,
    });
  }

  deleteIdentifier({id}) {
    log.debug('Deleting Host Identifier with id', id);
    return this.httpPost({
      cmd: 'delete_asset',
      asset_id: id,
    });
  }

  getElementFromRoot(root) {
    return root.get_asset.get_assets_response.asset;
  }
}

class HostsCommand extends EntitiesCommand {
  constructor(http) {
    super(http, 'asset', Host);
    this.setDefaultParam('asset_type', 'host');
  }

  getEntitiesResponse(root) {
    return root.get_assets.get_assets_response;
  }

  getModifiedAggregates({filter} = {}) {
    return this.getAggregates({
      aggregate_type: 'host',
      group_column: 'modified',
      subgroup_column: 'severity_level',
      filter,
    });
  }

  getSeverityAggregates({filter} = {}) {
    return this.getAggregates({
      aggregate_type: 'host',
      group_column: 'severity',
      filter,
    });
  }

  getVulnScoreAggregates({filter, max} = {}) {
    return this.getAggregates({
      filter,
      aggregate_type: 'host',
      group_column: 'uuid',
      textColumns: ['name', 'modified'],
      dataColumns: ['severity'],
      sort: [
        {
          field: 'severity',
          direction: 'descending',
          stat: 'max',
        },
        {
          field: 'modified',
          direction: 'descending',
        },
      ],
      maxGroups: max,
    });
  }
}

registerCommand('host', HostCommand);
registerCommand('hosts', HostsCommand);

// vim: set ts=2 sw=2 tw=80:

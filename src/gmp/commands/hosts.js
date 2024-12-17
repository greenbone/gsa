/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import registerCommand from 'gmp/command';
import logger from 'gmp/log';
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

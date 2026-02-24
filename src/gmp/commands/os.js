/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import registerCommand from 'gmp/command';
import EntitiesCommand from 'gmp/commands/entities';
import EntityCommand from 'gmp/commands/entity';
import HttpCommand, {BULK_SELECT_BY_IDS,} from 'gmp/commands/http';
import OperatingSystem from 'gmp/models/os';

class OperatingSystemCommand extends EntityCommand {
  constructor(http) {
    super(http, 'asset', OperatingSystem);
    this.setDefaultParam('asset_type', 'os');
  }

  getElementFromRoot(root) {
    return root.get_asset.get_assets_response.asset;
  }
}

class OperatingSystemsCommand extends EntitiesCommand {
  constructor(http) {
    super(http, 'asset', OperatingSystem);
    this.setDefaultParam('asset_type', 'os');
  }

  getEntitiesResponse(root) {
    return root.get_assets.get_assets_response;
  }

  getAverageSeverityAggregates({filter} = {}) {
    return this.getAggregates({
      aggregate_type: 'os',
      group_column: 'average_severity',
      filter,
    });
  }

  exportByIds(ids, asset_type) {
    const data = {
      cmd: 'bulk_export',
      resource_type: this.name,
      asset_type: asset_type,
      bulk_select: BULK_SELECT_BY_IDS,
    };
    for (const id of ids) {
      data['bulk_selected:' + id] = 1;
    }
    return this.httpRequestWithRejectionTransform('post', {data});
  }

  export(entities, asset_type) {
    return this.exportByIds(entities.map((element) => {return element.id}), asset_type);
  }

  getVulnScoreAggregates({filter, max} = {}) {
    return this.getAggregates({
      filter,
      aggregate_type: 'os',
      group_column: 'uuid',
      textColumns: ['name', 'hosts', 'modified'],
      dataColumns: ['average_severity', 'average_severity_score'],
      sort: [
        {
          field: 'average_severity_score',
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

registerCommand('operatingsystem', OperatingSystemCommand);
registerCommand('operatingsystems', OperatingSystemsCommand);

export {OperatingSystemCommand, OperatingSystemsCommand};

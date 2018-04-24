/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 * Steffen Waterkamp <steffen.waterkamp@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2017 - 2018 Greenbone Networks GmbH
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

import {EntitiesCommand, EntityCommand, register_command} from '../command.js';

import OperatingSystem from '../models/os.js';

class OperatingSystemCommand extends EntityCommand {

  constructor(http) {
    super(http, 'asset', OperatingSystem);
    this.setParam('asset_type', 'os');
  }

  getElementFromRoot(root) {
    return root.get_asset.get_assets_response.asset;
  }
}

class OperatingSystemsCommand extends EntitiesCommand {

  constructor(http) {
    super(http, 'asset', OperatingSystem);
    this.setParam('asset_type', 'os');
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

  getVulnScoreAggregates({filter, max} = {}) {
    return this.getAggregates({
      filter,
      aggregate_type: 'os',
      group_column: 'uuid',
      textColumns: [
        'name',
        'hosts',
        'modified',
      ],
      dataColumns: [
        'average_severity',
        'average_severity_score',
      ],
      sort: [{
        field: 'average_severity_score',
        direction: 'descending',
        stat: 'max',
      }, {
        field: 'modified',
        direction: 'descending',
      }],
      maxGroups: max,
    });
  }
}

register_command('operatingsystem', OperatingSystemCommand);
register_command('operatingsystems', OperatingSystemsCommand);

// vim: set ts=2 sw=2 tw=80:

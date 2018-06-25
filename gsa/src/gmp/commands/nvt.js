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

import {is_defined} from '../utils/identity';

import InfoEntitiesCommand from './infoentities.js';
import InfoEntityCommand from './infoentity.js';

import register_command from '../command.js';

import Nvt from '../models/nvt.js';

const info_filter = info => is_defined(info.nvt);

class NvtCommand extends InfoEntityCommand {

  constructor(http) {
    super(http, 'nvt', Nvt);
  }
}

class NvtsCommand extends InfoEntitiesCommand {

  constructor(http) {
    super(http, 'nvt', Nvt, info_filter);
  }

  getFamilyAggregates({filter} = {}) {
    return this.getAggregates({
      aggregate_type: 'nvt',
      group_column: 'family',
      filter,
      dataColumns: ['severity'],
    });
  }

  getSeverityAggregates({filter} = {}) {
    return this.getAggregates({
      aggregate_type: 'nvt',
      group_column: 'severity',
      filter,
    });
  }

  getQodAggregates({filter} = {}) {
    return this.getAggregates({
      aggregate_type: 'nvt',
      group_column: 'qod',
      filter,
    });
  }

  getQodTypeAggregates({filter} = {}) {
    return this.getAggregates({
      aggregate_type: 'nvt',
      group_column: 'qod_type',
      filter,
    });
  }

  getCreatedAggregates({filter} = {}) {
    return this.getAggregates({
      aggregate_type: 'nvt',
      group_column: 'created',
      filter,
    });
  }
}

register_command('nvt', NvtCommand);
register_command('nvts', NvtsCommand);

// vim: set ts=2 sw=2 tw=80:

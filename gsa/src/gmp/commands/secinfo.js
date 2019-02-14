/* Copyright (C) 2017-2019 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
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

import {isDefined} from '../utils/identity';

import InfoEntitiesCommand from './infoentities.js';
import InfoEntityCommand from './infoentity.js';

import registerCommand from '../command.js';

import SecInfo from '../models/secinfo.js';

const info_filter = info => isDefined(info.allinfo);

class SecInfoCommand extends InfoEntityCommand {
  constructor(http) {
    super(http, 'allinfo', SecInfo);
  }
}

class SecInfosCommand extends InfoEntitiesCommand {
  constructor(http) {
    super(http, 'allinfo', SecInfo, info_filter);
  }

  getCreatedAggregates({filter} = {}) {
    return this.getAggregates({
      aggregate_type: 'allinfo',
      group_column: 'created',
      filter,
    });
  }

  getSeverityAggregates({filter} = {}) {
    return this.getAggregates({
      aggregate_type: 'allinfo',
      group_column: 'severity',
      filter,
    });
  }

  getTypeAggregates({filter} = {}) {
    return this.getAggregates({
      aggregate_type: 'allinfo',
      group_column: 'type',
      filter,
    });
  }
}

registerCommand('secinfo', SecInfoCommand);
registerCommand('secinfos', SecInfosCommand);

// vim: set ts=2 sw=2 tw=80:

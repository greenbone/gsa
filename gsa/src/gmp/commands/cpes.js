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
import registerCommand from 'gmp/command';

import Cpe from 'gmp/models/cpe';

import {isDefined} from 'gmp/utils/identity';

import InfoEntitiesCommand from './infoentities';
import InfoEntityCommand from './infoentity';

const info_filter = info => isDefined(info.cpe);

class CpeCommand extends InfoEntityCommand {
  constructor(http) {
    super(http, 'cpe', Cpe);
  }
}

class CpesCommand extends InfoEntitiesCommand {
  constructor(http) {
    super(http, 'cpe', Cpe, info_filter);
  }

  getCreatedAggregates({filter} = {}) {
    return this.getAggregates({
      aggregate_type: 'cpe',
      group_column: 'created',
      filter,
    });
  }

  getSeverityAggregates({filter} = {}) {
    return this.getAggregates({
      aggregate_type: 'cpe',
      group_column: 'severity',
      filter,
    });
  }
}

registerCommand('cpe', CpeCommand);
registerCommand('cpes', CpesCommand);

// vim: set ts=2 sw=2 tw=80:

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

import Nvt from 'gmp/models/nvt';
import {isDefined} from 'gmp/utils/identity';

import InfoEntitiesCommand from './infoentities';
import InfoEntityCommand from './infoentity';

const info_filter = info => isDefined(info.nvt);

export class NvtCommand extends InfoEntityCommand {
  constructor(http) {
    super(http, 'nvt', Nvt);
  }

  getConfigNvt({oid, configId}) {
    return this.httpGet(
      {
        cmd: 'get_config_nvt',
        config_id: configId,
        oid,
      },
      {includeDefaultParams: false},
    ).then(response => {
      const {data} = response;
      const config_resp = data.get_config_nvt_response;

      const nvt = Nvt.fromElement(config_resp.get_nvts_response.nvt);

      return response.setData(nvt);
    });
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

registerCommand('nvt', NvtCommand);
registerCommand('nvts', NvtsCommand);

// vim: set ts=2 sw=2 tw=80:

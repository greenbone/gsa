/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import registerCommand from 'gmp/command';
import InfoEntitiesCommand from 'gmp/commands/infoentities';
import InfoEntityCommand from 'gmp/commands/infoentity';
import Nvt from 'gmp/models/nvt';
import {isDefined} from 'gmp/utils/identity';


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

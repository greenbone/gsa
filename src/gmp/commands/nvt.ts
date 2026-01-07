/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import InfoEntityCommand from 'gmp/commands/info-entity';
import type Http from 'gmp/http/http';
import Nvt from 'gmp/models/nvt';

class NvtCommand extends InfoEntityCommand<Nvt> {
  constructor(http: Http) {
    super(http, 'nvt', Nvt);
  }

  async getConfigNvt({oid, configId}: {oid: string; configId: string}) {
    const response = await this.httpGetWithTransform(
      {
        cmd: 'get_config_nvt',
        config_id: configId,
        oid,
      },
      {includeDefaultParams: false},
    );
    const {data} = response;
    const configResponse = data.get_config_nvt_response;
    // @ts-expect-error
    const nvt = Nvt.fromElement(configResponse.get_nvts_response);
    return response.setData(nvt);
  }
}

export default NvtCommand;

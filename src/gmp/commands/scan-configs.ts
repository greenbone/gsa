/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import EntitiesCommand from 'gmp/commands/entities';
import {
  type HttpCommandInputParams,
  type HttpCommandOptions,
} from 'gmp/commands/http';
import type Http from 'gmp/http/http';
import {type Element} from 'gmp/models/model';
import ScanConfig from 'gmp/models/scan-config';

class ScanConfigsCommand extends EntitiesCommand<ScanConfig> {
  constructor(http: Http) {
    super(http, 'config', ScanConfig);
  }

  getEntitiesResponse(root: Element): Element {
    // @ts-expect-error
    return root.get_configs.get_configs_response;
  }

  async get(
    params: HttpCommandInputParams = {},
    options: HttpCommandOptions = {},
  ) {
    const response = await this.httpGetWithTransform(
      {
        ...params,
        usage_type: 'scan',
      },
      options,
    );
    const {entities, filter, counts} = this.getCollectionListFromRoot(
      response.data,
    );
    return response.set(entities, {filter, counts});
  }
}

export default ScanConfigsCommand;

/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type CollectionCounts from 'gmp/collection/collection-counts';
import EntitiesCommand from 'gmp/commands/entities';
import {type HttpCommandOptions} from 'gmp/commands/http';
import PolicyCommand from 'gmp/commands/policy';
import type Http from 'gmp/http/http';
import type Filter from 'gmp/models/filter';
import {type Element} from 'gmp/models/model';
import Policy from 'gmp/models/policy';

export interface PoliciesCommandGetParams {
  filter?: Filter | string;
}

class PoliciesCommand extends EntitiesCommand<Policy> {
  constructor(http: Http) {
    super(http, 'config', Policy);
  }

  getEntitiesResponse(root: Element) {
    // @ts-expect-error
    return root.get_configs.get_configs_response;
  }

  async get(
    {filter}: PoliciesCommandGetParams = {},
    options?: HttpCommandOptions,
  ) {
    const params = {filter, usage_type: 'policy'};
    const response = await this.httpGetWithTransform(params, options);
    const {
      entities,
      filter: responseFilter,
      counts,
    } = this.getCollectionListFromRoot(response.data);
    return response.set<Policy[], {filter: Filter; counts: CollectionCounts}>(
      entities,
      {filter: responseFilter, counts},
    );
  }
}

export default PoliciesCommand;
export {PolicyCommand};

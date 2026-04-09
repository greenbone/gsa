/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type CollectionCounts from 'gmp/collection/collection-counts';
import AuditCommand from 'gmp/commands/audit';
import EntitiesCommand from 'gmp/commands/entities';
import {type HttpCommandOptions} from 'gmp/commands/http';
import type Http from 'gmp/http/http';
import Audit from 'gmp/models/audit';
import type Filter from 'gmp/models/filter';
import {type Element} from 'gmp/models/model';

export interface AuditsCommandGetParams {
  filter?: Filter | string;
}

class AuditsCommand extends EntitiesCommand<Audit> {
  constructor(http: Http) {
    super(http, 'task', Audit);
  }

  getEntitiesResponse(root: Element) {
    // @ts-expect-error
    return root.get_tasks.get_tasks_response;
  }

  async get(
    {filter}: AuditsCommandGetParams = {},
    options?: HttpCommandOptions,
  ) {
    const params = {filter, usage_type: 'audit'};
    const response = await this.httpGetWithTransform(params, options);
    const {
      entities,
      filter: responseFilter,
      counts,
    } = this.getCollectionListFromRoot(response.data);
    return response.set<Audit[], {filter: Filter; counts: CollectionCounts}>(
      entities,
      {filter: responseFilter, counts},
    );
  }
}

export default AuditsCommand;
export {AuditCommand};

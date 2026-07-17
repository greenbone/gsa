/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import EntitiesCommand from 'gmp/commands/entities';
import {BULK_SELECT_BY_IDS} from 'gmp/commands/http';
import type Http from 'gmp/http/http';
import {type FilterType} from 'gmp/models/filter';
import Host from 'gmp/models/host';
import {type Element} from 'gmp/models/model';

interface HostAggregatesParams {
  filter?: FilterType | string;
}

interface HostVulnerabilityScoreAggregatesParams extends HostAggregatesParams {
  max?: number;
}

class HostsCommand extends EntitiesCommand<Host> {
  constructor(http: Http) {
    super(http, 'asset', Host);
    this.setDefaultParam('asset_type', 'host');
  }

  getEntitiesResponse(root: Element) {
    // @ts-expect-error
    return root.get_assets.get_assets_response;
  }

  getModifiedAggregates({filter}: HostAggregatesParams = {}) {
    return this.getAggregates({
      aggregate_type: 'host',
      group_column: 'modified',
      subgroup_column: 'severity_level',
      filter,
    });
  }

  getSeverityAggregates({filter}: HostAggregatesParams = {}) {
    return this.getAggregates({
      aggregate_type: 'host',
      group_column: 'severity',
      filter,
    });
  }

  exportByIds(ids: string[]) {
    const data = {
      cmd: 'bulk_export',
      resource_type: this.name,
      assetType: 'host',
      bulk_select: BULK_SELECT_BY_IDS,
    };
    for (const id of ids) {
      data['bulk_selected:' + id] = 1;
    }
    return this.httpRequestWithRejectionTransform('post', {data});
  }

  export(entities: Host[]) {
    return this.exportByIds(entities.map(element => element.id as string));
  }

  getVulnScoreAggregates({
    filter,
    max,
  }: HostVulnerabilityScoreAggregatesParams = {}) {
    return this.getAggregates({
      filter,
      aggregate_type: 'host',
      group_column: 'uuid',
      textColumns: ['name', 'modified'],
      dataColumns: ['severity'],
      sort: [
        {
          field: 'severity',
          direction: 'descending',
          stat: 'max',
        },
        {
          field: 'modified',
          direction: 'descending',
        },
      ],
      maxGroups: max,
    });
  }
}

export default HostsCommand;

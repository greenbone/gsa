/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import EntitiesCommand from 'gmp/commands/entities';
import {BULK_SELECT_BY_IDS} from 'gmp/commands/http';
import type Http from 'gmp/http/http';
import type Filter from 'gmp/models/filter';
import {type Element} from 'gmp/models/model';
import OperatingSystem from 'gmp/models/os';

interface OperatingSystemAggregatesParams {
  filter?: Filter | string;
}

interface OperatingSystemVulnerabilityScoreAggregatesParams extends OperatingSystemAggregatesParams {
  max?: number;
}

class OperatingSystemsCommand extends EntitiesCommand<OperatingSystem> {
  constructor(http: Http) {
    super(http, 'asset', OperatingSystem);
    this.setDefaultParam('asset_type', 'os');
  }

  getEntitiesResponse(root: Element): Element {
    // @ts-expect-error
    return root.get_assets.get_assets_response;
  }

  exportByIds(ids: string[]) {
    const data = {
      cmd: 'bulk_export',
      resource_type: this.name,
      asset_type: 'os',
      bulk_select: BULK_SELECT_BY_IDS,
    };
    for (const id of ids) {
      data['bulk_selected:' + id] = 1;
    }
    return this.httpRequestWithRejectionTransform('post', {data});
  }

  export(entities: OperatingSystem[]) {
    return this.exportByIds(entities.map(element => element.id as string));
  }

  getAverageSeverityAggregates({filter}: OperatingSystemAggregatesParams = {}) {
    return this.getAggregates({
      aggregate_type: 'os',
      group_column: 'average_severity',
      filter,
    });
  }

  getVulnScoreAggregates({
    filter,
    max,
  }: OperatingSystemVulnerabilityScoreAggregatesParams = {}) {
    return this.getAggregates({
      filter,
      aggregate_type: 'os',
      group_column: 'uuid',
      textColumns: ['name', 'hosts', 'modified'],
      dataColumns: ['average_severity', 'average_severity_score'],
      sort: [
        {
          field: 'average_severity_score',
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

export default OperatingSystemsCommand;

/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import EntitiesCommand from 'gmp/commands/entities';
import type Http from 'gmp/http/http';
import type {XmlResponseData} from 'gmp/http/transform/fast-xml';
import type Filter from 'gmp/models/filter';
import Vulnerability from 'gmp/models/vulnerability';

class VulnerabilitiesCommand extends EntitiesCommand<Vulnerability> {
  constructor(http: Http) {
    super(http, 'vuln', Vulnerability);
  }

  getEntitiesResponse(root: XmlResponseData) {
    return (
      // @ts-expect-error
      root.get_vulns?.get_vulns_response ?? {}
    );
  }

  getSeverityAggregates({filter}: {filter?: Filter} = {}) {
    return this.getAggregates({
      aggregate_type: 'vuln',
      group_column: 'severity',
      filter,
    });
  }

  getHostAggregates({filter}: {filter?: Filter} = {}) {
    return this.getAggregates({
      aggregate_type: 'vuln',
      group_column: 'hosts',
      filter,
    });
  }
}

export default VulnerabilitiesCommand;

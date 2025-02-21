/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import registerCommand from 'gmp/command';
import EntitiesCommand from 'gmp/commands/entities';
import EntityCommand from 'gmp/commands/entity';
import Vulnerability from 'gmp/models/vulnerability';

class VulnerabilityCommand extends EntityCommand {
  constructor(http) {
    super(http, 'vuln', Vulnerability);
  }
}

class VulnerabilitiesCommand extends EntitiesCommand {
  constructor(http) {
    super(http, 'vuln', Vulnerability);
  }

  getEntitiesResponse(root) {
    return root.get_vulns.get_vulns_response;
  }

  getSeverityAggregates({filter} = {}) {
    return this.getAggregates({
      aggregate_type: 'vuln',
      group_column: 'severity',
      filter,
    });
  }

  getHostAggregates({filter} = {}) {
    return this.getAggregates({
      aggregate_type: 'vuln',
      group_column: 'hosts',
      filter,
    });
  }
}

registerCommand('vuln', VulnerabilityCommand);
registerCommand('vulns', VulnerabilitiesCommand);

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

import Vulnerability from 'gmp/models/vulnerability';

import EntitiesCommand from './entities';
import EntityCommand from './entity';

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

// vim: set ts=2 sw=2 tw=80:

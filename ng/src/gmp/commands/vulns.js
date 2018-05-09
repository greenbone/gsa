/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 * Steffen Waterkamp <steffen.waterkamp@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2017 - 2018 Greenbone Networks GmbH
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 */

import {EntityCommand, EntitiesCommand, register_command} from '../command.js';

import Vulnerability from '../models/vulnerability.js';

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

register_command('vuln', VulnerabilityCommand);
register_command('vulns', VulnerabilitiesCommand);

// vim: set ts=2 sw=2 tw=80:

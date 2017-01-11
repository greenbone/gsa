/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2016 - 2017 Greenbone Networks GmbH
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

import logger from '../../log.js';

import {EntityCommand, register_command} from '../command.js';

import Target from '../models/target.js';

const log = logger.getLogger('gmp.commands.targets');

export class TargetCommand extends EntityCommand {

  constructor(http) {
    super(http, 'target', Target);
  }

  create(args) {
    let {name, comment = '', target_source, hosts, exclude_hosts,
      reverse_lookup_only, reverse_lookup_unify, port_list_id, alive_tests,
      ssh_credential_id = 0, port, smb_credential_id = 0,
      esxi_credential_id = 0, snmp_credential_id = 0, file,
      hosts_filter} = args;
    log.debug('Creating new target', args);
    return this.httpPost({
      cmd: 'create_target',
      next: 'get_target',
      name,
      comment,
      target_source,
      hosts,
      exclude_hosts,
      reverse_lookup_only,
      reverse_lookup_unify,
      port_list_id,
      alive_tests,
      port,
      ssh_credential_id,
      smb_credential_id,
      esxi_credential_id,
      snmp_credential_id,
      file,
      hosts_filter,
    }).then(xhr => this.getModelFromResponse(xhr));
  }

  getElementFromResponse(xhr) {
    return xhr.get_target.get_targets_response.target;
  }
}

register_command('target', TargetCommand);

// vim: set ts=2 sw=2 tw=80:

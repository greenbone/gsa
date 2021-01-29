/* Copyright (C) 2016-2021 Greenbone Networks GmbH
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
import logger from 'gmp/log';

import {isString} from 'gmp/utils/identity';

import registerCommand from 'gmp/command';

import Target from 'gmp/models/target';

import EntitiesCommand from './entities';
import EntityCommand from './entity';

const log = logger.getLogger('gmp.commands.targets');

class TargetCommand extends EntityCommand {
  constructor(http) {
    super(http, 'target', Target);
  }

  create(args) {
    const {
      name,
      comment = '',
      target_source,
      target_exclude_source,
      hosts,
      exclude_hosts,
      reverse_lookup_only,
      reverse_lookup_unify,
      port_list_id,
      alive_tests,
      ssh_credential_id = 0,
      port,
      smb_credential_id = 0,
      esxi_credential_id = 0,
      snmp_credential_id = 0,
      file,
      exclude_file,
      hosts_filter,
    } = args;
    log.debug('Creating new target', args);
    return this.action({
      cmd: 'create_target',
      name,
      comment,
      target_source,
      target_exclude_source,
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
      exclude_file,
      hosts_filter,
    });
  }

  save(args) {
    const {
      id,
      name,
      comment = '',
      target_source,
      target_exclude_source,
      hosts,
      exclude_hosts,
      reverse_lookup_only,
      reverse_lookup_unify,
      port_list_id,
      alive_tests,
      ssh_credential_id = 0,
      port,
      smb_credential_id = 0,
      esxi_credential_id = 0,
      snmp_credential_id = 0,
      file,
      exclude_file,
      in_use,
    } = args;
    log.debug('Saving target', args);
    return this.action({
      cmd: 'save_target',
      target_id: id,
      alive_tests,
      comment,
      esxi_credential_id,
      exclude_hosts,
      file,
      exclude_file,
      hosts,
      in_use: isString(in_use) ? in_use : in_use ? '1' : '0',
      name,
      port,
      port_list_id,
      reverse_lookup_only,
      reverse_lookup_unify,
      smb_credential_id,
      snmp_credential_id,
      ssh_credential_id,
      target_source,
      target_exclude_source,
    });
  }

  getElementFromRoot(root) {
    return root.get_target.get_targets_response.target;
  }
}

class TargetsCommand extends EntitiesCommand {
  constructor(http) {
    super(http, 'target', Target);
  }

  getEntitiesResponse(root) {
    return root.get_targets.get_targets_response;
  }
}

registerCommand('target', TargetCommand);
registerCommand('targets', TargetsCommand);

// vim: set ts=2 sw=2 tw=80:

/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import registerCommand from 'gmp/command';
import EntitiesCommand from 'gmp/commands/entities';
import EntityCommand from 'gmp/commands/entity';
import logger from 'gmp/log';
import Target from 'gmp/models/target';
import {isString} from 'gmp/utils/identity';
import {UNSET_VALUE} from 'web/utils/Render';


const log = logger.getLogger('gmp.commands.targets');

export class TargetCommand extends EntityCommand {
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
      allowSimultaneousIPs,
      ssh_credential_id = 0,
      ssh_elevate_credential_id = 0,
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
      allow_simultaneous_ips: allowSimultaneousIPs,
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
      ssh_elevate_credential_id:
        ssh_credential_id === UNSET_VALUE
          ? UNSET_VALUE
          : ssh_elevate_credential_id,
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
      allowSimultaneousIPs,
      ssh_credential_id = 0,
      ssh_elevate_credential_id = 0,
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
      allow_simultaneous_ips: allowSimultaneousIPs,
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
      ssh_elevate_credential_id:
        ssh_credential_id === UNSET_VALUE
          ? UNSET_VALUE
          : ssh_elevate_credential_id,
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

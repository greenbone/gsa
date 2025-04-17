/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import registerCommand from 'gmp/command';
import EntitiesCommand from 'gmp/commands/entities';
import EntityCommand from 'gmp/commands/entity';
import {feedStatusRejection} from 'gmp/commands/feedstatus';
import logger from 'gmp/log';
import Target from 'gmp/models/target';
import {isString} from 'gmp/utils/identity';
import {UNSET_VALUE} from 'web/utils/Render';

const log = logger.getLogger('gmp.commands.targets');

export class TargetCommand extends EntityCommand {
  constructor(http) {
    super(http, 'target', Target);
  }

  async create(args) {
    const {
      name,
      comment = '',
      targetSource,
      targetExcludeSource,
      hosts,
      excludeHosts,
      reverseLookupOnly,
      reverseLookupUnify,
      portListId,
      aliveTests,
      allowSimultaneousIPs,
      sshCredentialId = 0,
      sshElevateCredentialId = 0,
      port,
      smbCredentialId = 0,
      esxiCredentialId = 0,
      snmpCredentialId = 0,
      krb5CredentialId = 0,
      file,
      excludeFile,
      hostsFilter,
    } = args;
    log.debug('Creating new target', args);
    try {
      return await this.action({
        cmd: 'create_target',
        name,
        comment,
        allow_simultaneous_ips: allowSimultaneousIPs,
        target_source: targetSource,
        target_exclude_source: targetExcludeSource,
        hosts,
        exclude_hosts: excludeHosts,
        reverse_lookup_only: reverseLookupOnly,
        reverse_lookup_unify: reverseLookupUnify,
        port_list_id: portListId,
        alive_tests: aliveTests,
        port,
        ssh_credential_id: sshCredentialId,
        ssh_elevate_credential_id:
          sshCredentialId === UNSET_VALUE
            ? UNSET_VALUE
            : sshElevateCredentialId,
        smb_credential_id: smbCredentialId,
        esxi_credential_id: esxiCredentialId,
        snmp_credential_id: snmpCredentialId,
        krb5_credential_id: krb5CredentialId,
        file,
        exclude_file: excludeFile,
        hosts_filter: hostsFilter,
      });
    } catch (rejection) {
      await feedStatusRejection(this.http, rejection);
    }
  }

  async save(args) {
    const {
      id,
      name,
      comment = '',
      targetSource,
      targetExcludeSource,
      hosts,
      excludeHosts,
      reverseLookupOnly,
      reverseLookupUnify,
      portListId,
      aliveTests,
      allowSimultaneousIPs,
      sshCredentialId = 0,
      sshElevateCredentialId = 0,
      port,
      smbCredentialId = 0,
      esxiCredentialId = 0,
      snmpCredentialId = 0,
      krb5CredentialId = 0,
      file,
      excludeFile,
      inUse,
    } = args;
    log.debug('Saving target', args);
    try {
      return await this.action({
        cmd: 'save_target',
        target_id: id,
        alive_tests: aliveTests,
        allow_simultaneous_ips: allowSimultaneousIPs,
        comment,
        esxi_credential_id: esxiCredentialId,
        exclude_hosts: excludeHosts,
        file,
        exclude_file: excludeFile,
        hosts,
        in_use: isString(inUse) ? inUse : inUse ? '1' : '0',
        name,
        port,
        port_list_id: portListId,
        reverse_lookup_only: reverseLookupOnly,
        reverse_lookup_unify: reverseLookupUnify,
        smb_credential_id: smbCredentialId,
        snmp_credential_id: snmpCredentialId,
        ssh_credential_id: sshCredentialId,
        ssh_elevate_credential_id:
          sshCredentialId === UNSET_VALUE
            ? UNSET_VALUE
            : sshElevateCredentialId,
        krb5_credential_id: krb5CredentialId,
        target_source: targetSource,
        target_exclude_source: targetExcludeSource,
      });
    } catch (rejection) {
      await feedStatusRejection(this.http, rejection);
    }
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

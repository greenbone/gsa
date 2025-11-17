/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import EntityCommand from 'gmp/commands/entity';
import {feedStatusRejection} from 'gmp/commands/feed-status';
import type Http from 'gmp/http/http';
import type Filter from 'gmp/models/filter';
import {filterString} from 'gmp/models/filter/utils';
import Target, {type AliveTest} from 'gmp/models/target';
import {type YesNo} from 'gmp/parser';
import {isDefined} from 'gmp/utils/identity';
import {UNSET_VALUE} from 'web/utils/Render';

export type TargetSource = 'manual' | 'file' | 'asset_hosts';
export type TargetExcludeSource = 'manual' | 'file';

interface TargetCommandCreateParams {
  aliveTests?: AliveTest[];
  allowSimultaneousIPs?: YesNo;
  comment?: string;
  esxiCredentialId?: string;
  excludeFile?: string;
  excludeHosts?: string;
  file?: string;
  hosts?: string;
  hostsFilter?: Filter;
  krb5CredentialId?: string;
  name: string;
  port?: number;
  portListId?: string;
  reverseLookupOnly?: YesNo;
  reverseLookupUnify?: YesNo;
  smbCredentialId?: string;
  snmpCredentialId?: string;
  sshCredentialId?: string;
  sshElevateCredentialId?: string;
  targetExcludeSource?: TargetExcludeSource;
  targetSource?: TargetSource;
}

export interface TargetCommandSaveParams extends TargetCommandCreateParams {
  id: string;
}

class TargetCommand extends EntityCommand<Target> {
  constructor(http: Http) {
    super(http, 'target', Target);
  }

  async create({
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
    sshCredentialId = UNSET_VALUE,
    sshElevateCredentialId = UNSET_VALUE,
    port,
    smbCredentialId = UNSET_VALUE,
    esxiCredentialId = UNSET_VALUE,
    snmpCredentialId = UNSET_VALUE,
    krb5CredentialId = UNSET_VALUE,
    file,
    excludeFile,
    hostsFilter,
  }: TargetCommandCreateParams) {
    try {
      return await this.entityAction({
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
        'alive_tests:': aliveTests,
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
        hosts_filter: filterString(hostsFilter),
      });
    } catch (rejection) {
      await feedStatusRejection(this.http, rejection as Error);
      // never reached because feedStatusRejection always throws. just to satisfy TS
      throw rejection;
    }
  }

  async save({
    id,
    name,
    comment,
    targetSource,
    targetExcludeSource,
    hosts,
    excludeHosts,
    reverseLookupOnly,
    reverseLookupUnify,
    portListId,
    aliveTests,
    allowSimultaneousIPs,
    sshCredentialId,
    sshElevateCredentialId,
    port,
    smbCredentialId,
    esxiCredentialId,
    snmpCredentialId,
    krb5CredentialId,
    file,
    excludeFile,
  }: TargetCommandSaveParams) {
    try {
      return await this.action({
        cmd: 'save_target',
        target_id: id,
        'alive_tests:': aliveTests,
        allow_simultaneous_ips: allowSimultaneousIPs,
        comment,
        esxi_credential_id: esxiCredentialId,
        exclude_hosts: excludeHosts,
        file,
        exclude_file: excludeFile,
        hosts,
        name,
        port,
        port_list_id: portListId,
        reverse_lookup_only: reverseLookupOnly,
        reverse_lookup_unify: reverseLookupUnify,
        smb_credential_id: smbCredentialId,
        snmp_credential_id: snmpCredentialId,
        ssh_credential_id: sshCredentialId,
        ssh_elevate_credential_id: isDefined(sshCredentialId)
          ? sshElevateCredentialId
          : undefined,
        krb5_credential_id: krb5CredentialId,
        target_source: targetSource,
        target_exclude_source: targetExcludeSource,
      });
    } catch (rejection) {
      await feedStatusRejection(this.http, rejection as Error);
      // never reached because feedStatusRejection always throws. just to satisfy TS
      throw rejection;
    }
  }

  getElementFromRoot(root) {
    return root.get_target.get_targets_response.target;
  }
}

export default TargetCommand;

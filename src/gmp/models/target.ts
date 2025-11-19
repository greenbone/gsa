/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Model, {type ModelElement, type ModelProperties} from 'gmp/models/model';
import PortList, {type PortListElement} from 'gmp/models/port-list';
import {
  parseInt,
  parseYesNo,
  parseCsv,
  type YesNo,
  NO_VALUE,
  parseBoolean,
} from 'gmp/parser';
import {map} from 'gmp/utils/array';
import {isDefined} from 'gmp/utils/identity';
import {isEmpty} from 'gmp/utils/string';

interface AliveTestsElement {
  alive_test?: AliveTest | AliveTest[];
}

interface SSHCredentialElement extends ModelElement {
  port?: number;
}

interface TargetElement extends ModelElement {
  alive_tests?: AliveTestsElement;
  allow_simultaneous_ips?: YesNo;
  esxi_credential?: ModelElement;
  exclude_hosts?: string;
  hosts?: string;
  krb5_credential?: ModelElement;
  max_hosts?: number;
  port_list?: PortListElement;
  reverse_lookup_only?: YesNo;
  reverse_lookup_unify?: YesNo;
  smb_credential?: ModelElement;
  snmp_credential?: ModelElement;
  ssh_credential?: SSHCredentialElement;
  ssh_elevate_credential?: ModelElement;
  tasks?: {
    task: ModelElement | ModelElement[];
  };
}

interface SSHCredentialProperties extends ModelProperties {
  port?: number;
}

interface TargetProperties extends ModelProperties {
  aliveTests?: AliveTest[];
  allowSimultaneousIPs?: boolean;
  esxiCredential?: Model;
  excludeHosts?: string[];
  hosts?: string[];
  krb5Credential?: Model;
  maxHosts?: number;
  portList?: PortList;
  reverseLookupOnly?: YesNo;
  reverseLookupUnify?: YesNo;
  smbCredential?: Model;
  snmpCredential?: Model;
  sshCredential?: SSHCredential;
  sshElevateCredential?: Model;
  tasks?: Model[];
}

export type AliveTest =
  | typeof ARP_PING
  | typeof CONSIDER_ALIVE
  | typeof ICMP_PING
  | typeof SCAN_CONFIG_DEFAULT
  | typeof TCP_ACK
  | typeof TCP_SYN;

export const SCAN_CONFIG_DEFAULT = 'Scan Config Default';
export const ICMP_PING = 'ICMP Ping';
export const TCP_ACK = 'TCP-ACK Service Ping';
export const TCP_SYN = 'TCP-SYN Service Ping';
export const ARP_PING = 'ARP Ping';
export const CONSIDER_ALIVE = 'Consider Alive';

class SSHCredential extends Model {
  static readonly entityType = 'credential';

  readonly port?: number;

  constructor({port, ...properties}: SSHCredentialProperties = {}) {
    super(properties);
    this.port = port;
  }

  static fromElement(element: SSHCredentialElement = {}): SSHCredential {
    return new SSHCredential(this.parseElement(element));
  }

  static parseElement(element: SSHCredentialElement): SSHCredentialProperties {
    const ret = super.parseElement(element) as SSHCredentialProperties;
    ret.port = parseInt(element.port);
    return ret;
  }
}

class Target extends Model {
  static readonly entityType = 'target';

  readonly aliveTests: AliveTest[];
  readonly allowSimultaneousIPs: boolean;
  readonly esxiCredential?: Model;
  readonly excludeHosts: string[];
  readonly hosts: string[];
  readonly krb5Credential?: Model;
  readonly maxHosts: number;
  readonly portList?: PortList;
  readonly reverseLookupOnly: YesNo;
  readonly reverseLookupUnify: YesNo;
  readonly smbCredential?: Model;
  readonly snmpCredential?: Model;
  readonly sshCredential?: SSHCredential;
  readonly sshElevateCredential?: Model;
  readonly tasks?: Model[];

  constructor({
    aliveTests = [],
    allowSimultaneousIPs = false,
    esxiCredential,
    excludeHosts = [],
    hosts = [],
    krb5Credential,
    maxHosts = 0,
    portList,
    reverseLookupOnly = NO_VALUE,
    reverseLookupUnify = NO_VALUE,
    smbCredential,
    snmpCredential,
    sshCredential,
    sshElevateCredential,
    tasks = [],
    ...properties
  }: TargetProperties = {}) {
    super(properties);

    this.aliveTests = aliveTests;
    this.allowSimultaneousIPs = allowSimultaneousIPs;
    this.esxiCredential = esxiCredential;
    this.excludeHosts = excludeHosts;
    this.hosts = hosts;
    this.krb5Credential = krb5Credential;
    this.maxHosts = maxHosts;
    this.portList = portList;
    this.reverseLookupOnly = reverseLookupOnly;
    this.reverseLookupUnify = reverseLookupUnify;
    this.smbCredential = smbCredential;
    this.snmpCredential = snmpCredential;
    this.sshCredential = sshCredential;
    this.sshElevateCredential = sshElevateCredential;
    this.tasks = tasks;
  }

  static fromElement(element: TargetElement = {}): Target {
    return new Target(this.parseElement(element));
  }

  static parseElement(element: TargetElement): TargetProperties {
    const ret = super.parseElement(element) as TargetProperties;

    if (isDefined(element.port_list) && !isEmpty(element.port_list._id)) {
      ret.portList = PortList.fromElement(element.port_list);
    } else {
      delete ret.portList;
    }

    ret.aliveTests = map(
      element.alive_tests?.alive_test,
      aliveTest => aliveTest as AliveTest,
    );

    if (
      isDefined(element.ssh_credential) &&
      !isEmpty(element.ssh_credential._id)
    ) {
      ret.sshCredential = SSHCredential.fromElement(element.ssh_credential);
    } else {
      delete ret.sshCredential;
    }
    if (
      isDefined(element.esxi_credential) &&
      !isEmpty(element.esxi_credential._id)
    ) {
      ret.esxiCredential = Model.fromElement(
        element.esxi_credential,
        'credential',
      );
    } else {
      delete ret.esxiCredential;
    }
    if (
      isDefined(element.smb_credential) &&
      !isEmpty(element.smb_credential._id)
    ) {
      ret.smbCredential = Model.fromElement(
        element.smb_credential,
        'credential',
      );
    } else {
      delete ret.smbCredential;
    }
    if (
      isDefined(element.snmp_credential) &&
      !isEmpty(element.snmp_credential._id)
    ) {
      ret.snmpCredential = Model.fromElement(
        element.snmp_credential,
        'credential',
      );
    } else {
      delete ret.snmpCredential;
    }
    if (
      isDefined(element.ssh_elevate_credential) &&
      !isEmpty(element.ssh_elevate_credential._id)
    ) {
      ret.sshElevateCredential = Model.fromElement(
        element.ssh_elevate_credential,
        'credential',
      );
    } else {
      delete ret.sshElevateCredential;
    }
    if (
      isDefined(element.krb5_credential) &&
      !isEmpty(element.krb5_credential._id)
    ) {
      ret.krb5Credential = Model.fromElement(
        element.krb5_credential,
        'credential',
      );
    } else {
      delete ret.krb5Credential;
    }

    ret.hosts = parseCsv(element.hosts);
    ret.excludeHosts = parseCsv(element.exclude_hosts);

    ret.maxHosts = parseInt(element.max_hosts);

    ret.reverseLookupOnly = parseYesNo(element.reverse_lookup_only);
    ret.reverseLookupUnify = parseYesNo(element.reverse_lookup_unify);

    if (isDefined(element.tasks)) {
      ret.tasks = map(element.tasks.task, task =>
        Model.fromElement(task, 'task'),
      );
    }

    ret.allowSimultaneousIPs = isDefined(element.allow_simultaneous_ips)
      ? parseBoolean(element.allow_simultaneous_ips)
      : undefined;

    return ret;
  }
}

export default Target;

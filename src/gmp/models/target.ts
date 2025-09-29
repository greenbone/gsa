/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Model, {ModelElement, ModelProperties} from 'gmp/models/model';
import PortList, {PortListElement} from 'gmp/models/portlist';
import {parseInt, parseYesNo, parseCsv, YesNo, NO_VALUE} from 'gmp/parser';
import {map} from 'gmp/utils/array';
import {isDefined} from 'gmp/utils/identity';
import {isEmpty} from 'gmp/utils/string';

interface TargetElement extends ModelElement {
  alive_tests?: string;
  allow_simultaneous_ips?: YesNo;
  esxi_credential?: ModelElement;
  exclude_hosts?: string;
  hosts?: string;
  krb5_credential?: ModelElement;
  max_hosts?: string;
  port_list?: PortListElement;
  reverse_lookup_only?: YesNo;
  reverse_lookup_unify?: YesNo;
  smb_credential?: ModelElement;
  snmp_credential?: ModelElement;
  ssh_credential?: ModelElement;
  ssh_elevate_credential?: ModelElement;
  tasks?: {
    task: ModelElement[];
  };
}

interface TargetProperties extends ModelProperties {
  alive_tests?: AliveTests;
  allowSimultaneousIPs?: YesNo;
  esxi_credential?: Model;
  exclude_hosts?: string[];
  hosts?: string[];
  krb5_credential?: Model;
  max_hosts?: number;
  port_list?: PortList;
  reverse_lookup_only?: YesNo;
  reverse_lookup_unify?: YesNo;
  smb_credential?: Model;
  snmp_credential?: Model;
  ssh_credential?: Model;
  ssh_elevate_credential?: Model;
  tasks?: Model[];
}

export type AliveTests = (typeof ALIVE_TESTS)[keyof typeof ALIVE_TESTS];

export const TARGET_CREDENTIAL_NAMES = [
  'smb_credential',
  'snmp_credential',
  'ssh_credential',
  'esxi_credential',
  'ssh_elevate_credential',
  'krb5_credential',
];

export const ALIVE_TESTS = {
  SCAN_CONFIG_DEFAULT: 'Scan Config Default',
  ICMP_PING: 'ICMP Ping',
  TCP_ACK: 'TCP-ACK Service Ping',
  TCP_SYN: 'TCP-SYN Service Ping',
  ARP_PING: 'ARP Ping',
  ICMP_TCP_ACK: 'ICMP & TCP-ACK Service Ping',
  ICMP_ARP_PING: 'ICMP & ARP Ping',
  TCP_ACK_ARP_PING: 'TCP-ACK Service & ARP Ping',
  ICMP_TCP_ACK_ARP_PING: 'ICMP, TCP-ACK Service & ARP Ping',
  CONSIDER_ALIVE: 'Consider Alive',
} as const;

class Target extends Model {
  static readonly entityType = 'target';

  readonly alive_tests?: AliveTests;
  readonly allowSimultaneousIPs: YesNo;
  readonly esxi_credential?: Model;
  readonly exclude_hosts: string[];
  readonly hosts: string[];
  readonly krb5_credential?: Model;
  readonly max_hosts: number;
  readonly port_list?: PortList;
  readonly reverse_lookup_only: YesNo;
  readonly reverse_lookup_unify: YesNo;
  readonly smb_credential?: Model;
  readonly snmp_credential?: Model;
  readonly ssh_credential?: Model;
  readonly ssh_elevate_credential?: Model;
  readonly tasks?: Model[];

  constructor({
    // eslint-disable-next-line @typescript-eslint/naming-convention
    alive_tests,
    allowSimultaneousIPs = NO_VALUE,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    esxi_credential,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    exclude_hosts = [],
    hosts = [],
    // eslint-disable-next-line @typescript-eslint/naming-convention
    krb5_credential,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    max_hosts = 0,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    port_list,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    reverse_lookup_only = NO_VALUE,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    reverse_lookup_unify = NO_VALUE,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    smb_credential,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    snmp_credential,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    ssh_credential,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    ssh_elevate_credential,
    tasks = [],
    ...properties
  }: TargetProperties = {}) {
    super(properties);

    this.alive_tests = alive_tests;
    this.allowSimultaneousIPs = allowSimultaneousIPs;
    this.esxi_credential = esxi_credential;
    this.exclude_hosts = exclude_hosts;
    this.hosts = hosts;
    this.krb5_credential = krb5_credential;
    this.max_hosts = max_hosts;
    this.port_list = port_list;
    this.reverse_lookup_only = reverse_lookup_only;
    this.reverse_lookup_unify = reverse_lookup_unify;
    this.smb_credential = smb_credential;
    this.snmp_credential = snmp_credential;
    this.ssh_credential = ssh_credential;
    this.ssh_elevate_credential = ssh_elevate_credential;
    this.tasks = tasks;
  }

  static fromElement(element: TargetElement = {}): Target {
    return new Target(this.parseElement(element));
  }
  static parseElement(element: TargetElement): TargetProperties {
    const ret = super.parseElement(element) as TargetProperties;

    if (isDefined(element.port_list) && !isEmpty(element.port_list._id)) {
      ret.port_list = PortList.fromElement(element.port_list);
    } else {
      delete ret.port_list;
    }

    if (isDefined(element.alive_tests)) {
      ret.alive_tests = element.alive_tests as AliveTests;
    }

    for (const name of TARGET_CREDENTIAL_NAMES) {
      const cred = ret[name];
      if (isDefined(cred) && !isEmpty(cred._id)) {
        ret[name] = Model.fromElement(cred, 'credential');
      } else {
        delete ret[name];
      }
    }

    ret.hosts = parseCsv(element.hosts);
    ret.exclude_hosts = parseCsv(element.exclude_hosts);

    ret.max_hosts = parseInt(element.max_hosts);

    ret.reverse_lookup_only = parseYesNo(element.reverse_lookup_only);
    ret.reverse_lookup_unify = parseYesNo(element.reverse_lookup_unify);

    if (isDefined(element.tasks)) {
      ret.tasks = map(element.tasks.task, task =>
        Model.fromElement(task, 'task'),
      );
    }

    ret.allowSimultaneousIPs = parseYesNo(element.allow_simultaneous_ips);

    return ret;
  }
}

export default Target;

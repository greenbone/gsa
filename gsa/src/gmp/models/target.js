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
import {_l} from 'gmp/locale/lang';

import Model, {parseModelFromElement, parseModelFromObject} from 'gmp/model';

import {hasValue, isDefined} from 'gmp/utils/identity';
import {isEmpty} from 'gmp/utils/string';
import {map} from 'gmp/utils/array';

import {parseInt, parseYesNo, parseCsv} from 'gmp/parser';

import PortList from './portlist';

export const TARGET_CREDENTIAL_NAMES = [
  'smb_credential',
  'snmp_credential',
  'ssh_credential',
  'esxi_credential',
];

export const HYPERION_TARGET_CREDENTIAL_NAMES = [
  'smbCredential',
  'snmpCredential',
  'sshCredential',
  'esxiCredential',
];

export const ALIVE_TESTS = {
  SCAN_CONFIG_DEFAULT: _l('Scan Config Default'),
  ICMP_PING: _l('ICMP Ping'),
  TCP_ACK_SERVICE_PING: _l('TCP-ACK Service Ping'),
  TCP_SYN_SERVICE_PING: _l('TCP-SYN Service Ping'),
  ARP_PING: _l('ARP Ping'),
  ICMP_AND_TCP_ACK_SERVICE_PING: _l('ICMP & TCP-ACK Service Ping'),
  ICMP_AND_ARP_PING: _l('ICMP & ARP Ping'),
  TCP_ACK_SERVICE_AND_ARP_PING: _l('TCP-ACK Service & ARP Ping'),
  ICMP_TCP_ACK_SERVICE_AND_ARP_PING: _l('ICMP, TCP-ACK Service & ARP Ping'),
  CONSIDER_ALIVE: _l('Consider Alive'),
};

export const getTranslatableAliveTest = key => `${ALIVE_TESTS[key]}`;

class Target extends Model {
  static entityType = 'target';

  static parseElement(element) {
    const ret = super.parseElement(element);

    if (!isDefined(ret.id) && isDefined(ret.uuid)) {
      ret.id = ret.uuid;
    }

    if (isDefined(element.port_list) && !isEmpty(element.port_list._id)) {
      ret.port_list = PortList.fromElement(ret.port_list);
    } else {
      delete ret.port_list;
    }

    for (const name of TARGET_CREDENTIAL_NAMES) {
      const cred = ret[name];
      if (isDefined(cred) && !isEmpty(cred._id)) {
        ret[name] = parseModelFromElement(cred, 'credential');
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
        parseModelFromElement(task, 'task'),
      );
    }

    ret.allowSimultaneousIPs = parseYesNo(element.allow_simultaneous_ips);

    return ret;
  }

  static parseObject(object) {
    const ret = super.parseObject(object);

    if (hasValue(object.portList) && hasValue(object.portList.id)) {
      ret.portList = PortList.fromObject(ret.portList);
    } else {
      delete ret.portList;
    }

    for (const name of HYPERION_TARGET_CREDENTIAL_NAMES) {
      const cred = ret[name];
      if (hasValue(cred) && hasValue(cred.id)) {
        ret[name] = parseModelFromObject(cred, 'credential');
      } else {
        delete ret[name];
      }
    }

    ret.reverseLookupOnly = parseYesNo(object.reverseLookupOnly);
    ret.reverseLookupUnify = parseYesNo(object.reverseLookupUnify);

    if (hasValue(object.tasks)) {
      ret.tasks = map(object.tasks, task =>
        parseModelFromElement(task, 'task'),
      );
    }

    ret.allowSimultaneousIPs = parseYesNo(object.allowSimultaneousIPs);

    return ret;
  }
}

export default Target;

// vim: set ts=2 sw=2 tw=80:

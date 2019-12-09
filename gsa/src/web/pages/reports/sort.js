/* Copyright (C) 2017-2019 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
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

import {
  makeCompareDate,
  makeCompareIp,
  makeCompareNumber,
  makeCompareSeverity,
  makeCompareString,
} from 'web/utils/sort';

export const appsSortFunctions = {
  name: makeCompareString('name'),
  hosts: makeCompareNumber(entity => entity.hosts.count),
  occurrences: makeCompareNumber(entity => entity.occurrences.total),
  severity: makeCompareSeverity(),
};

export const closedCvesSortFunctions = {
  cve: makeCompareString('id'),
  host: makeCompareIp(entity => entity.host.ip),
  nvt: makeCompareString(entity => entity.source.description),
  severity: makeCompareSeverity(),
};

export const cvesSortFunctions = {
  cve: makeCompareString(entity => entity.cves.join(' ')),
  hosts: makeCompareNumber(entity => entity.hosts.count),
  occurrences: makeCompareNumber(entity => entity.occurrences),
  severity: makeCompareSeverity(),
};

export const errorsSortFunctions = {
  error: makeCompareString('description'),
  host: makeCompareIp(entity => entity.host.ip),
  hostname: makeCompareString(entity => entity.host.name),
  nvt: makeCompareString(entity => entity.nvt.name),
  port: makeCompareString('port'),
};

export const operatingssystemsSortFunctions = {
  name: makeCompareString('name'),
  cpe: makeCompareString('id'),
  hosts: makeCompareNumber(entity => entity.hosts.count),
  severity: makeCompareNumber('severity', 0),
};

export const portsSortFunctions = {
  name: makeCompareString('id'),
  hosts: makeCompareNumber(entity => entity.hosts.count),
  severity: makeCompareSeverity(),
};

export const tlsCertificatesSortFunctions = {
  dn: makeCompareString('issuer'),
  serial: makeCompareString('serial'),
  notvalidbefore: makeCompareDate('notbefore'),
  notvalidafter: makeCompareDate('notafter'),
  ip: makeCompareIp('ip'),
  hostname: makeCompareString('hostname'),
  port: makeCompareString('port'),
};

// vim: set ts=2 sw=2 tw=80:

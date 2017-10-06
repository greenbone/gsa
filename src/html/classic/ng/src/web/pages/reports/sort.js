/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2017 Greenbone Networks GmbH
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
  make_compare_date,
  make_compare_ip,
  make_compare_number,
  make_compare_severity,
  make_compare_string,
} from 'gmp/sort.js';

export const apps_sort_functions = {
  name: make_compare_string('name'),
  hosts: make_compare_number(entity => entity.hosts.count),
  occurrences: make_compare_number(entity => entity.occurrences.total),
  severity: make_compare_severity(),
};

export const closed_cves_sort_functions = {
  cve: make_compare_string('id'),
  host: make_compare_ip(entity => entity.host.ip),
  nvt: make_compare_string(entity => entity.source.description),
  severity: make_compare_severity(),
};

export const cves_sort_functions = {
  cve: make_compare_string(entity => entity.cves.join(' ')),
  hosts: make_compare_number(entity => entity.hosts.count),
  occurrences: make_compare_number(entity => entity.occurrences),
  severity: make_compare_severity(),
};

export const errors_sort_functions = {
  error: make_compare_string('description'),
  host: make_compare_ip(entity => entity.host.ip),
  nvt: make_compare_string(entity => entity.nvt.name),
  port: make_compare_string('port'),
};

export const hosts_sort_functions = {
  ip: make_compare_ip('ip'),
  hostname: make_compare_string('hostname'),
  os: make_compare_string(entity => entity.details.best_os_cpe),
  high: make_compare_number(entity => entity.result_counts.hole),
  medium: make_compare_number(entity => entity.result_counts.warning),
  low: make_compare_number(entity => entity.result_counts.info),
  log: make_compare_number(entity => entity.result_counts.log),
  false_positive: make_compare_number(
    entity => entity.result_counts.false_positive),
  total: make_compare_number(entity => entity.result_counts.total),
  severity: make_compare_severity(),
};

export const operatingssystems_sort_functions = {
  name: make_compare_string('name'),
  cpe: make_compare_string('id'),
  hosts: make_compare_number(entity => entity.hosts.count),
  severity: make_compare_number('severity', 0),
};

export const ports_sort_functions = {
  name: make_compare_string('id'),
  hosts: make_compare_number(entity => entity.hosts.count),
  severity: make_compare_severity(),
};

export const results_sort_functions = {
  delta: make_compare_string(entity => entity.delta.delta_type),
  created: make_compare_date('creation_time'),
  host: make_compare_ip(entity => entity.host.name),
  location: make_compare_string('port'),
  qod: make_compare_number(entity => entity.qod.value),
  severity: make_compare_severity(),
  solution_type: make_compare_string(entity => entity.nvt.tags.solution_type),
  vulnerability: make_compare_string('vulnerability'),
};

export const tls_certificates_sort_functions = {
  dn: make_compare_string('issuer'),
  serial: make_compare_string('serial'),
  notvalidbefore: make_compare_date('notbefore'),
  notvalidafter: make_compare_date('notafter'),
  ip: make_compare_ip('ip'),
  hostname: make_compare_string('hostname'),
  port: make_compare_string('port'),
};

export const vulnerabilities_sort_functions = {
  name: make_compare_string('name'),
  oldest: make_compare_date(entity => entity.results.oldest),
  newest: make_compare_date(entity => entity.results.newest),
  qod: make_compare_number(entity => entity.qod.value),
  results: make_compare_number(entity => entity.results.count),
  hosts: make_compare_number(entity => entity.hosts.count),
  severity: make_compare_severity(),
};

// vim: set ts=2 sw=2 tw=80:

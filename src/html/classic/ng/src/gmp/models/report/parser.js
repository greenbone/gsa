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

import 'babel-polyfill'; // required for Object.entries, Object.values

import {filter as filter_func, for_each, is_defined, map} from '../../utils.js';

import {parse_int, parse_severity} from '../../parser.js';

import {
  parse_collection_list,
  parse_filter,
  parse_report_result_entities,
} from '../../collection/parser.js';

import CollectionList from '../../collection/collectionlist.js';
import CollectionCounts from '../../collection/collectioncounts.js';

import App from './app.js';
import Host from './host.js';
import OperatingSystem from './os.js';
import Port from './port.js';
import Vulerability from './vulnerability.js';

import Result from '../result.js';

const empty_collection_list = filter => {
  return new CollectionList({filter});
};

export const parse_ports = (report, filter) => {
  const temp_ports = {};
  const {ports} = report;

  if (!is_defined(ports)) {
    return empty_collection_list(filter);
  }

  const {count: full_count} = ports;

  for_each(ports.port, port => {
    const {__text: id} = port;

    let tport = temp_ports[id];

    if (is_defined(tport)) {
      const severity = parse_severity(port.severity);

      tport.setSeverity(severity);
    }
    else {
      tport = new Port(port);
      temp_ports[id] = tport;
    }

    tport.addHost({ip: port.host});
  });

  const ports_array = Object.values(temp_ports);
  const filtered_count = ports_array.length;

  const counts = new CollectionCounts({
    all: full_count,
    filtered: filtered_count,
    first: 1,
    length: filtered_count,
    rows: filtered_count,
  });

  return new CollectionList({
    entries: ports_array.sort((porta, portb) => porta.number > portb.number),
    filter: is_defined(filter) ? filter : parse_filter(report),
    counts,
  });
};

export const parse_vulnerabilities = (report, filter) => {
  const temp_vulns = {};
  const {vulns, results = {}} = report;
  const {count: full_count} = vulns;

  if (!is_defined(vulns)) {
    return empty_collection_list(filter);
  }

  for_each(results.result, result => {
    const {nvt, host} = result;
    const {_oid: oid} = nvt;

    let vuln = temp_vulns[oid];

    if (is_defined(vuln)) {
      const severity = parse_severity(result.severity);

      if (severity > vuln.severity) {
        vuln.severity = severity;
      }

      vuln.addResult(results);
    }
    else {
      vuln = new Vulerability(result);
      temp_vulns[oid] = vuln;
    }

    vuln.addHost(host);
  });

  const vulns_array = Object.values(temp_vulns);
  const filtered_count = vulns_array.length;

  const counts = new CollectionCounts({
    all: full_count,
    filtered: filtered_count,
    first: 1,
    length: filtered_count,
    rows: filtered_count,
  });

  return new CollectionList({
    entries: vulns_array,
    filter: is_defined(filter) ? filter : parse_filter(report),
    counts,
  });
};

export const parse_apps = (report, filter) => {
  const {host: hosts, apps, results = {}} = report;
  const apps_temp = {};
  const cpe_host_details = {};
  const full_count = apps.count;

  if (!is_defined(apps)) {
    return empty_collection_list(filter);
  }

  const severities = {};

  // if the there are several results find the highest severity for the cpe
  for_each(results.result, result => {
    const result_severity = parse_severity(result.severity);
    if (is_defined(result.detection)) {
      filter_func(result.detection.result.details.detail,
        detail => detail.name === 'product'
      ).forEach(detail => {
        const {value: cpe} = detail;
        const severity = severities[cpe];

        if (is_defined(severity)) {
          if (severity < result_severity) {
            severities[cpe] = result_severity;
          }
        }
        else {
          severities[cpe] = result_severity;
        }
      });
    }
  });

  // Collect Apps and their hosts
  for_each(hosts, host => {
    const {detail: details} = host;

    for_each(details, detail => {
      const {name} = detail;

      if (name === 'App') {
        const cpe = detail.value;
        let app = apps_temp[cpe];

        if (!is_defined(app)) {
          app = new App({...detail, severity: severities[cpe]});
          apps_temp[cpe] = app;
        }

        app.addHost(host);
      }
      else if (name.startsWith('cpe:/a')) {
        const details_count_for_cpe = cpe_host_details[name];

        if (is_defined(details_count_for_cpe)) {
          cpe_host_details[name] += 1;
        }
        else {
          cpe_host_details[name] = 1;
        }
      }
    });
  });

  const apps_array = Object.values(apps_temp);

  // Collect host and occurrence counts
  for (const app of apps_array) {
    const details_count_for_cpe = cpe_host_details[app.id];
    app.addOccurence(details_count_for_cpe);
  };

  const filtered_count = apps_array.length;

  const counts = new CollectionCounts({
    all: full_count,
    filtered: filtered_count,
    first: 1,
    length: filtered_count,
    rows: filtered_count,
  });

  return new CollectionList({
    filter: is_defined(filter) ? filter : parse_filter(report),
    entries: apps_array,
    counts,
  });
};

export const parse_host_severities = (results = {}) => {
  const severities = {};

  // if the there are several results find the highest severity for the ip
  for_each(results.result, result => {
    const {host} = result;
    const {__text: ip} = host;
    const result_severity = parse_severity(result.severity);
    const severity = severities[ip];

    if (is_defined(severity)) {
      if (severity < result_severity) {
        severities[ip] = result_severity;
      }
    }
    else {
      severities[ip] = result_severity;
    }
  });

  return severities;
};

export const parse_operatingsystems = (report, filter) => {
  const {host: hosts, results, os: os_count} = report;

  if (!is_defined(os_count)) {
    return empty_collection_list(filter);
  }

  const operating_systems = {};

  const severities = parse_host_severities(results);

  for_each(hosts, host => {
    const {detail: details, ip} = host;

    let best_os_cpe;
    let best_os_txt;

    for_each(details, detail => {
      const {name, value} = detail;
      if (name === 'best_os_cpe') {
        best_os_cpe = value;
      }
      else if (name === 'best_os_txt') {
        best_os_txt = value;
      }
    });

    if (is_defined(best_os_cpe)) {
      let os = operating_systems[best_os_cpe];
      const severity = severities[ip];

      if (!is_defined(os)) {
        os = operating_systems[best_os_cpe] = new OperatingSystem({
          best_os_cpe,
          best_os_txt,
        });
      }

      os.addHost(host);
      os.addSeverity(severity);
    }
  });

  const os_array = Object.values(operating_systems);
  const filtered_count = os_array.length;

  const counts = new CollectionCounts({
    all: os_count.count,
    filtered: filtered_count,
    first: 1,
    length: filtered_count,
    rows: filtered_count,
  });

  return new CollectionList({
    filter: is_defined(filter) ? filter : parse_filter(report),
    entries: os_array,
    counts,
  });
};

export const parse_hosts = (report, filter) => {
  const {host: hosts, results, hosts: hosts_count} = report;

  if (!is_defined(hosts_count)) {
    return empty_collection_list(filter);
  }

  const severities = parse_host_severities(results);

  const hosts_array = map(hosts, host => {
    const severity = severities[host.ip];
    return new Host({...host, severity});
  });

  const filtered_count = hosts_array.length;

  const counts = new CollectionCounts({
    all: hosts_count.count,
    filtered: filtered_count,
    first: 1,
    length: filtered_count,
    rows: filtered_count,
  });

  return new CollectionList({
    counts,
    entries: hosts_array,
    filter: is_defined(filter) ? filter : parse_filter(report),
  });
};

const parse_report_report_counts = elem => {
  const es = elem.results;
  const ec = elem.result_count;

  const length = is_defined(es.result) ? es.result.length : 0;

  const counts = {
    first: es._start,
    rows: ec.filtered,
    length,
    all: ec.full,
    filtered: ec.filtered,
  };
  return new CollectionCounts(counts);
};

export const parse_results = (report, filter) => {
  const {results} = report;

  if (!is_defined(results)) {
    return empty_collection_list(filter);
  }

  return parse_collection_list(report, 'result', Result, {
    entities_parse_func: parse_report_result_entities,
    collection_count_parse_func: parse_report_report_counts,
  });
};

// vim: set ts=2 sw=2 tw=80:


/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2017 - 2018 Greenbone Networks GmbH
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
import 'core-js/fn/object/entries';
import 'core-js/fn/object/values';
import 'core-js/fn/string/includes';
import 'core-js/fn/string/starts-with';

import moment from 'moment';

import {is_defined} from '../../utils/identity';
import {is_empty} from '../../utils/string';
import {
  filter as filter_func,
  for_each,
  map,
} from '../../utils/array';

import {parse_severity} from '../../parser.js';

import {
  parse_collection_list,
  parse_filter,
  parse_report_result_entities,
} from '../../collection/parser.js';

import CollectionCounts from '../../collection/collectioncounts.js';

import App from './app.js';
import Cve from './cve.js';
import Host from './host.js';
import OperatingSystem from './os.js';
import Port from './port.js';
import TLSCertificate from './tlscertificate.js';
import Vulerability from './vulnerability.js';

import Result from '../result.js';

const empty_collection_list = filter => {
  return {
    filter,
    counts: new CollectionCounts(),
    entities: [],
  };
};

const get_cert = (certs, fingerprint) => {
  let cert = certs[fingerprint];

  if (!is_defined(cert)) {
    cert = new TLSCertificate(fingerprint);
    certs[fingerprint] = cert;

  }
  return cert;
};

export const parse_tls_certificates = (report, filter) => {
  const {host: hosts, ssl_certs} = report;

  if (!is_defined(ssl_certs)) {
    return empty_collection_list(filter);
  }

  const {count: full_count} = ssl_certs;

  let certs_array = [];

  for_each(hosts, host => {
    const host_certs = {};
    let hostname;

    for_each(host.detail, detail => {
      const {name = '', value = ''} = detail;

      if (name.startsWith('SSLInfo')) {
        const [port, fingerprint] = value.split('::');

        const cert = get_cert(host_certs, fingerprint);

        cert.ip = host.ip;

        cert.addPort(port);
      }
      else if (name.startsWith('SSLDetails')) {
        const [, fingerprint] = name.split(':');

        const cert = get_cert(host_certs, fingerprint);

        value.split('|').reduce((c, v) => {
          let [key, val] = v.split(':');
          if (key === 'notAfter' || key === 'notBefore') {
            val = is_defined(val) ? moment(val) : val;
          }
          c[key.toLowerCase()] = val;
          return c;
        }, cert);

        cert.details = value;
      }
      else if (name.startsWith('Cert')) {
        const [, fingerprint] = name.split(':');

        const cert = get_cert(host_certs, fingerprint);

        // currently cert data starts with x509:
        // not sure if there are other types of certs
        // therefore keep original data

        cert._data = value;

        if (value.includes(':')) {
          const [, data] = value.split(':');
          cert.data = data;
        }
        else {
          cert.data = value;
        }
      }
      else if (name === 'hostname') {
        // collect hostnames
        hostname = value;
      }
    });

    const certs = Object.values(host_certs);

    if (is_defined(hostname)) {
      for (const cert of certs) {
        cert.hostname = hostname;
      }
    }

    certs_array = certs_array.concat(certs);
  });

  // create a cert per port
  const certs_per_port = [];
  certs_array.forEach(cert => {
    cert.ports.forEach(port => {
      cert = cert.copy();
      cert.port = port;

      delete cert.ports;

      certs_per_port.push(cert);
    });
  });

  const {length: filtered_count} = certs_per_port;

  const counts = new CollectionCounts({
    all: full_count,
    filtered: filtered_count,
    first: 1,
    length: filtered_count,
    rows: filtered_count,
  });

  return {
    counts,
    entities: certs_per_port,
    filter: is_defined(filter) ? filter : parse_filter(report),
  };
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

    if (is_defined(id) && !id.startsWith('general')) {
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
    }
  });

  const ports_array = Object.values(temp_ports);
  const {length: filtered_count} = ports_array;

  const counts = new CollectionCounts({
    all: full_count,
    filtered: filtered_count,
    first: 1,
    length: filtered_count,
    rows: filtered_count,
  });

  return {
    entities: ports_array.sort((porta, portb) => porta.number > portb.number),
    filter: is_defined(filter) ? filter : parse_filter(report),
    counts,
  };
};

export const parse_vulnerabilities = (report, filter) => {
  const temp_vulns = {};
  const {vulns, results = {}} = report;

  if (!is_defined(vulns)) {
    return empty_collection_list(filter);
  }

  const {count: full_count} = vulns;

  for_each(results.result, result => {
    const {nvt = {}, host} = result;
    const {_oid: oid} = nvt;

    if (is_defined(oid)) {
      const severity = parse_severity(result.severity);

      let vuln = temp_vulns[oid];

      if (is_defined(vuln)) {

        vuln.addResult(results);
      }
      else {
        vuln = new Vulerability(result);
        temp_vulns[oid] = vuln;
      }

      vuln.setSeverity(severity);
      vuln.addHost(host);
    }
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

  return {
    entities: vulns_array,
    filter: is_defined(filter) ? filter : parse_filter(report),
    counts,
  };
};

export const parse_apps = (report, filter) => {
  const {host: hosts, apps, results = {}} = report;
  const apps_temp = {};
  const cpe_host_details = {};

  if (!is_defined(apps)) {
    return empty_collection_list(filter);
  }

  const {count: full_count} = apps;
  const severities = {};

  // if there are several results find the highest severity for the cpe
  for_each(results.result, result => {
    const result_severity = parse_severity(result.severity);

    if (is_defined(result.detection) && is_defined(result.detection.result) &&
      is_defined(result.detection.result.details)) {
      filter_func(result.detection.result.details.detail,
        detail => detail.name === 'product'
      ).forEach(detail => {
        const {value: cpe} = detail;

        if (is_defined(cpe)) {
          const severity = severities[cpe];

          if (is_defined(severity)) {
            if (severity < result_severity) {
              severities[cpe] = result_severity;
            }
          }
          else {
            severities[cpe] = result_severity;
          }
        }
      });
    }
  });

  // Collect Apps and their hosts
  for_each(hosts, host => {
    const {detail: details} = host;

    for_each(details, detail => {
      const {name = ''} = detail;

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

  const {length: filtered_count} = apps_array;

  const counts = new CollectionCounts({
    all: full_count,
    filtered: filtered_count,
    first: 1,
    length: filtered_count,
    rows: filtered_count,
  });

  return {
    filter: is_defined(filter) ? filter : parse_filter(report),
    entities: apps_array,
    counts,
  };
};

export const parse_host_severities = (results = {}) => {
  const severities = {};

  // if the there are several results find the highest severity for the ip
  for_each(results.result, result => {
    const {host} = result;
    const {__text: ip} = host;

    if (is_defined(ip)) {
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

    if (is_defined(ip)) {
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
    }
  });

  const os_array = Object.values(operating_systems);
  const {length: filtered_count} = os_array;

  const counts = new CollectionCounts({
    all: os_count.count,
    filtered: filtered_count,
    first: 1,
    length: filtered_count,
    rows: filtered_count,
  });

  return {
    filter: is_defined(filter) ? filter : parse_filter(report),
    entities: os_array,
    counts,
  };
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

  const {length: filtered_count} = hosts_array;

  const counts = new CollectionCounts({
    all: hosts_count.count,
    filtered: filtered_count,
    first: 1,
    length: filtered_count,
    rows: filtered_count,
  });

  return {
    counts,
    entities: hosts_array,
    filter: is_defined(filter) ? filter : parse_filter(report),
  };
};

const parse_report_report_counts = elem => {
  const es = elem.results;
  const ec = elem.result_count;

  const length = is_defined(es.result) ? es.result.length : 0;

  const counts = {
    first: es._start,
    rows: ec.filtered,
    length,
    all: is_defined(ec.full) ? ec.full : ec.filtered, // ec.full isn't available for delta reports
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

export const parse_errors = (report, filter) => {
  const {host: hosts, errors} = report;

  if (!is_defined(errors)) {
    return empty_collection_list(filter);
  }

  const {count: full_count} = errors;

  const hostnames_by_ip = {};

  for_each(hosts, host => {
    const {ip} = host;

    if (is_defined(ip)) {
      for_each(host.detail, detail => {
        const {name, value} = detail;
        if (name === 'hostname') {
          // collect hostname
          hostnames_by_ip[ip] = value;
        }
      });
    }
  });

  const errors_array = filter_func(errors.error, error =>
    is_defined(error.host) && is_defined(error.nvt)
  ).map(error => {
    const {host, description, port, nvt} = error;
    const {__text: ip, asset} = host;
    const hostname = hostnames_by_ip[ip];
    return {
      id: ip + nvt._oid, // unique id for react key
      description,
      host: {
        ip,
        name: hostname,
        id: is_defined(asset) && !is_empty(asset._asset_id) ?
          asset._asset_id : undefined,
      },
      nvt: {
        id: nvt._oid,
        name: nvt.name,
      },
      port,
    };
  });

  const filtered_count = errors_array.length;

  const counts = new CollectionCounts({
    all: full_count,
    filtered: filtered_count,
    first: 1,
    length: filtered_count,
    rows: filtered_count,
  });

  return {
    counts,
    entities: errors_array,
    filter: is_defined(filter) ? filter : parse_filter(report),
  };
};

export const parse_closed_cves = (report, filter) => {
  const {host: hosts, closed_cves} = report;

  if (!is_defined(closed_cves)) {
    return empty_collection_list(filter);
  }

  // count doesn't fit to our counting of cves. we split the db rows with a csv
  // list of cves into several cves.
  // const {count: full_count} = closed_cves;

  let cves_array = [];

  for_each(hosts, host => {
    let host_cves = [];
    let hostname;

    for_each(host.detail, detail => {
      const {name, value = '', extra, source} = detail;

      if (is_defined(name)) {
        if (name.startsWith('Closed CVE')) {
          host_cves = host_cves.concat(value.split(',').map(val => {
            return {
              id: val.trim(),
              host: {
                ip: host.ip,
                id: is_defined(host.asset) ? host.asset._asset_id : undefined,
              },
              source,
              severity: parse_severity(extra),
            };
          }));
        }
        else if (name === 'hostname') {
          // collect hostname
          hostname = value;
        }
      }
    });

    if (is_defined(hostname)) {
      host_cves.forEach(cve => {
        cve.host.name = hostname;
      });
    }

    cves_array = cves_array.concat(host_cves);
  });

  const {length: filtered_count} = cves_array;

  const counts = new CollectionCounts({
    all: filtered_count,
    filtered: filtered_count,
    first: 1,
    length: filtered_count,
    rows: filtered_count,
  });

  return {
    counts,
    entities: cves_array,
    filter: is_defined(filter) ? filter : parse_filter(report),
  };
};

export const parse_cves = (report, filter) => {
  const {results} = report;

  if (!is_defined(results)) {
    return empty_collection_list(filter);
  }

  const cves = {};

  const results_with_cve = filter_func(results.result,
    result => result.nvt.cve !== 'NOCVE' && !is_empty(result.nvt.cve));

  results_with_cve.forEach(result => {
    const {host = {}, nvt = {}} = result;
    const {cve: id} = nvt;

    if (is_defined(id)) {
      let cve = cves[id];

      if (!is_defined(cve)) {
        cve = new Cve(nvt);
        cves[id] = cve;
      }

      const {__text: ip} = host;

      if (is_defined(ip)) {
        cve.addHost({ip});
      }
      cve.addResult(result);
    }
  });

  const cves_array = Object.values(cves);

  const {length: filtered_count} = cves_array;

  const counts = new CollectionCounts({
    all: filtered_count,
    filtered: filtered_count,
    first: 1,
    length: filtered_count,
    rows: filtered_count,
  });

  return {
    counts,
    entities: cves_array,
    filter: is_defined(filter) ? filter : parse_filter(report),
  };
};

// vim: set ts=2 sw=2 tw=80:


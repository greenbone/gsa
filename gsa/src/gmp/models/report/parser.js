/* Copyright (C) 2017-2021 Greenbone Networks GmbH
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

import {isDefined} from 'gmp/utils/identity';
import {isEmpty} from 'gmp/utils/string';
import {filter as filter_func, forEach, map} from 'gmp/utils/array';

import {parseSeverity, parseDate} from 'gmp/parser';

import {
  parseCollectionList,
  parseFilter,
  parseReportResultEntities,
} from 'gmp/collection/parser';

import CollectionCounts from 'gmp/collection/collectioncounts';

import ReportApp from './app';
import ReportCve from './cve';
import ReportHost from './host';
import ReportOperatingSystem from './os';
import ReportPort from './port';
import ReportTLSCertificate from './tlscertificate';

import Result from '../result';
import {getRefs, hasRefType} from '../nvt';

// reports with details=1 always have a results element
// (that can be empty) whereas reports with details=0
// never have a results element
const isReportWithDetails = results => isDefined(results);

const emptyCollectionList = filter => {
  return {
    filter,
    entities: [],
  };
};

const getTlsCertificate = (certs, fingerprint) => {
  let cert = certs[fingerprint];

  if (!isDefined(cert)) {
    cert = ReportTLSCertificate.fromElement({fingerprint});
    certs[fingerprint] = cert;
  }
  return cert;
};

export const parseTlsCertificates = (report, filter) => {
  const {host: hosts, ssl_certs, results} = report;

  if (!isDefined(ssl_certs) || !isReportWithDetails(results)) {
    return emptyCollectionList(filter);
  }

  const {count: full_count} = ssl_certs;

  let certs_array = [];

  forEach(hosts, host => {
    const host_certs = {};
    let hostname;

    forEach(host.detail, detail => {
      const {name = '', value = ''} = detail;

      if (name.startsWith('SSLInfo')) {
        const [port, fingerprint] = value.split('::');

        const cert = getTlsCertificate(host_certs, fingerprint);

        cert.ip = host.ip;

        cert.addPort(port);
      } else if (name.startsWith('SSLDetails')) {
        const [, fingerprint] = name.split(':');

        const cert = getTlsCertificate(host_certs, fingerprint);

        value.split('|').reduce((c, v) => {
          let [key, val] = v.split(':');
          if (key === 'notAfter' || key === 'notBefore') {
            val = parseDate(val);
          }
          c[key.toLowerCase()] = val;
          return c;
        }, cert);

        cert.details = value;
      } else if (name.startsWith('Cert')) {
        const [, fingerprint] = name.split(':');

        const cert = getTlsCertificate(host_certs, fingerprint);

        // currently cert data starts with x509:
        // not sure if there are other types of certs
        // therefore keep original data

        cert._data = value;

        if (value.includes(':')) {
          const [, data] = value.split(':');
          cert.data = data;
        } else {
          cert.data = value;
        }
      } else if (name === 'hostname') {
        // collect hostnames
        hostname = value;
      }
    });

    const certs = Object.values(host_certs);

    if (isDefined(hostname)) {
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
    filter: isDefined(filter) ? filter : parseFilter(report),
  };
};

export const parsePorts = (report, filter) => {
  const temp_ports = {};
  const {ports} = report;

  if (!isDefined(ports)) {
    return emptyCollectionList(filter);
  }

  const {count: full_count} = ports;

  forEach(ports.port, port => {
    const {__text: id} = port;

    if (isDefined(id) && !id.startsWith('general')) {
      let tport = temp_ports[id];

      if (isDefined(tport)) {
        const severity = parseSeverity(port.severity);

        tport.setSeverity(severity);
      } else {
        tport = ReportPort.fromElement(port);
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
    filter: isDefined(filter) ? filter : parseFilter(report),
    counts,
  };
};

export const parseApps = (report, filter) => {
  const {host: hosts, apps, results = {}} = report;
  const apps_temp = {};
  const cpe_host_details = {};

  if (!isDefined(apps) || !isReportWithDetails(results)) {
    return emptyCollectionList(filter);
  }

  const {count: full_count} = apps;
  const severities = {};

  // if there are several results find the highest severity for the cpe
  forEach(results.result, result => {
    const result_severity = parseSeverity(result.severity);

    if (
      isDefined(result.detection) &&
      isDefined(result.detection.result) &&
      isDefined(result.detection.result.details)
    ) {
      filter_func(
        result.detection.result.details.detail,
        detail => detail.name === 'product',
      ).forEach(detail => {
        const {value: cpe} = detail;

        if (isDefined(cpe)) {
          const severity = severities[cpe];

          if (isDefined(severity)) {
            if (severity < result_severity) {
              severities[cpe] = result_severity;
            }
          } else {
            severities[cpe] = result_severity;
          }
        }
      });
    }
  });

  // Collect Apps and their hosts
  forEach(hosts, host => {
    const {detail: details} = host;

    forEach(details, detail => {
      const {name = ''} = detail;

      if (name === 'App') {
        const cpe = detail.value;
        let app = apps_temp[cpe];

        if (!isDefined(app)) {
          app = ReportApp.fromElement({...detail, severity: severities[cpe]});
          apps_temp[cpe] = app;
        }

        app.addHost(host);
      } else if (name.startsWith('cpe:/a')) {
        const details_count_for_cpe = cpe_host_details[name];

        if (isDefined(details_count_for_cpe)) {
          cpe_host_details[name] += 1;
        } else {
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
  }

  const {length: filtered_count} = apps_array;

  const counts = new CollectionCounts({
    all: full_count,
    filtered: filtered_count,
    first: 1,
    length: filtered_count,
    rows: filtered_count,
  });

  return {
    filter: isDefined(filter) ? filter : parseFilter(report),
    entities: apps_array,
    counts,
  };
};

export const parseHostSeverities = (results = {}) => {
  const severities = {};

  // if the there are several results find the highest severity for the ip
  forEach(results.result, result => {
    const {host} = result;
    const {__text: ip} = host;

    if (isDefined(ip)) {
      const result_severity = parseSeverity(result.severity);
      const severity = severities[ip];

      if (isDefined(severity)) {
        if (severity < result_severity) {
          severities[ip] = result_severity;
        }
      } else {
        severities[ip] = result_severity;
      }
    }
  });

  return severities;
};

export const parseOperatingSystems = (report, filter) => {
  const {host: hosts, results, os: os_count} = report;

  if (!isDefined(os_count) || !isReportWithDetails(results)) {
    return emptyCollectionList(filter);
  }

  const operating_systems = {};

  const severities = parseHostSeverities(results);

  forEach(hosts, host => {
    const {detail: details, ip} = host;

    let best_os_cpe;
    let best_os_txt;

    if (isDefined(ip)) {
      forEach(details, detail => {
        const {name, value} = detail;
        if (name === 'best_os_cpe') {
          best_os_cpe = value;
        } else if (name === 'best_os_txt') {
          best_os_txt = value;
        }
      });

      if (isDefined(best_os_cpe)) {
        let os = operating_systems[best_os_cpe];
        const severity = severities[ip];

        if (!isDefined(os)) {
          os = operating_systems[
            best_os_cpe
          ] = ReportOperatingSystem.fromElement({
            best_os_cpe,
            best_os_txt,
          });
        }

        os.addHost(host);
        os.setSeverity(severity);
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
    filter: isDefined(filter) ? filter : parseFilter(report),
    entities: os_array,
    counts,
  };
};

export const parseHosts = (report, filter) => {
  const {host: hosts, results, hosts: hosts_count} = report;

  if (
    (!isDefined(hosts) && !isDefined(hosts_count)) ||
    !isReportWithDetails(results)
  ) {
    return emptyCollectionList(filter);
  }

  const severities = parseHostSeverities(results);

  const hosts_array = map(hosts, host => {
    const {port_count = {}} = host;
    const severity = severities[host.ip];
    return ReportHost.fromElement({
      ...host,
      severity,
      portsCount: port_count.page,
    });
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
    filter: isDefined(filter) ? filter : parseFilter(report),
  };
};

const parse_report_report_counts = elem => {
  const es = isDefined(elem.results) ? elem.results : {};
  const ec = elem.result_count;

  const length = isDefined(es.result) ? es.result.length : 0;

  const counts = {
    first: es._start,
    rows: ec.filtered,
    length,
    all: isDefined(ec.full) ? ec.full : ec.filtered, // ec.full isn't available for delta reports
    filtered: ec.filtered,
  };
  return new CollectionCounts(counts);
};

export const parseResults = (report, filter) => {
  const {results, result_count} = report;

  if (!isDefined(results) && !isDefined(result_count)) {
    return undefined;
    // instead of returning empty_collection_list(filter) we return an undefined
    // in order to query if results have been loaded and make a difference to
    // "loaded, but 0 total". This is used for showing the Loading indicator at
    // the report details
  }

  return parseCollectionList(report, 'result', Result, {
    entities_parse_func: parseReportResultEntities,
    collection_count_parse_func: parse_report_report_counts,
  });
};

export const parse_errors = (report, filter) => {
  const {host: hosts, errors, results} = report;

  if (!isDefined(errors) || !isReportWithDetails(results)) {
    return emptyCollectionList(filter);
  }

  const {count: full_count} = errors;

  const hostnames_by_ip = {};

  forEach(hosts, host => {
    const {ip} = host;

    if (isDefined(ip)) {
      forEach(host.detail, detail => {
        const {name, value} = detail;
        if (name === 'hostname') {
          // collect hostname
          hostnames_by_ip[ip] = value;
        }
      });
    }
  });

  const errors_array = filter_func(
    errors.error,
    error => isDefined(error.host) && isDefined(error.nvt),
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
        id:
          isDefined(asset) && !isEmpty(asset._asset_id)
            ? asset._asset_id
            : undefined,
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
    filter: isDefined(filter) ? filter : parseFilter(report),
  };
};

export const parseClosedCves = (report, filter) => {
  const {host: hosts, closed_cves, results} = report;

  if (!isDefined(closed_cves) || !isReportWithDetails(results)) {
    return emptyCollectionList(filter);
  }

  // count doesn't fit to our counting of cves. we split the db rows with a csv
  // list of cves into several cves.
  // const {count: full_count} = closed_cves;

  let cves_array = [];

  forEach(hosts, host => {
    let hostname;
    const host_cves = {};

    forEach(host.detail, detail => {
      const {name, value = '', extra, source} = detail;

      if (isDefined(name)) {
        if (name.startsWith('Closed CVE')) {
          value.split(',').forEach(val => {
            const cveId = val.trim();
            const cve = {
              id: cveId + '-' + host.ip + '-' + source.name,
              cveId,
              host: {
                ip: host.ip,
                id: isDefined(host.asset) ? host.asset._asset_id : undefined,
              },
              source,
              severity: parseSeverity(extra),
            };

            const existingCve = host_cves[cveId];
            if (
              isDefined(existingCve) &&
              isDefined(existingCve.severity) &&
              (existingCve.severity > cve.severity || !isDefined(cve.severity))
            ) {
              // always use highest severity
              cve.severity = existingCve.severity;
            }

            host_cves[cveId] = cve;
          });
        } else if (name === 'hostname') {
          // collect hostname
          hostname = value;
        }
      }
    });

    if (isDefined(hostname)) {
      for (const cve of Object.values(host_cves)) {
        cve.host.name = hostname;
      }
    }

    cves_array = cves_array.concat(Object.values(host_cves));
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
    filter: isDefined(filter) ? filter : parseFilter(report),
  };
};

export const parseCves = (report, filter) => {
  const {results} = report;

  if (!isDefined(results)) {
    return emptyCollectionList(filter);
  }

  const cves = {};

  const results_with_cve = filter_func(results.result, result => {
    const refs = getRefs(result.nvt);
    return refs.some(hasRefType('cve'));
  });

  results_with_cve.forEach(result => {
    const {host = {}, nvt} = result;
    const {_oid: id} = nvt;
    let cve = cves[id];

    if (!isDefined(cve)) {
      cve = ReportCve.fromElement(nvt);
      cves[id] = cve;
    }

    const {__text: ip} = host;

    if (isDefined(ip)) {
      cve.addHost({ip});
    }
    cve.addResult(result);
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
    filter: isDefined(filter) ? filter : parseFilter(report),
  };
};

// vim: set ts=2 sw=2 tw=80:

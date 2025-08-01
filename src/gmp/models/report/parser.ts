/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import CollectionCounts from 'gmp/collection/CollectionCounts';
import {
  CollectionList,
  parseCollectionList,
  parseReportResultEntities,
} from 'gmp/collection/parser';
import {ComplianceType} from 'gmp/models/compliance';
import Filter from 'gmp/models/filter';
import {
  getRefs,
  hasRefType,
  NvtRefElement,
  NvtSeveritiesElement,
} from 'gmp/models/nvt';
import ReportApp from 'gmp/models/report/app';
import ReportCve from 'gmp/models/report/cve';
import ReportHost from 'gmp/models/report/host';
import ReportOperatingSystem from 'gmp/models/report/os';
import ReportPort from 'gmp/models/report/port';
import ReportTLSCertificate, {
  ReportTLSCertificateElement,
} from 'gmp/models/report/tlscertificate';
import Result from 'gmp/models/result';
import {parseSeverity, QoDParams} from 'gmp/parser';
import {filter as filterFunc, forEach, map} from 'gmp/utils/array';
import {isArray, isDefined} from 'gmp/utils/identity';
import {isEmpty} from 'gmp/utils/string';

export interface CountElement {
  count?: number;
}

interface ErrorElement {
  description?: string;
  host?: {
    __text: string; // ip
    asset?: {
      _asset_id?: string;
    };
  };
  nvt?: {
    _oid?: string;
    cvss_base?: number;
    name?: string;
    type?: 'cve' | 'nvt';
  };
  port?: string;
  scan_nvt_version?: string;
  severity?: number;
}

export interface ErrorsElement extends CountElement {
  error: ErrorElement | ErrorElement[];
}

interface ReportResultElement {
  _id?: string;
  compliance?: ComplianceType; // only for compliance reports
  creation_time?: string;
  delta?: string; // only for delta reports
  description?: string;
  detection?: {
    result?: {
      _id?: string;
      details?: {
        detail?: {
          name?: string;
          value?: string | number;
        }[];
      };
    };
  };
  host?: {
    __text?: string;
    asset?: {
      _asset_id?: string;
    };
    hostname?: string;
  };
  name?: string;
  nvt?: {
    _oid?: string;
    cvss_base?: number;
    epss?: {
      max_epss?: {
        cve?: {
          _id?: string;
          severity?: number;
        };
        percentile?: number;
        score?: number;
      };
      max_severity?: {
        cve?: {
          _id?: string;
          severity?: number;
        };
        percentile?: number;
        score?: number;
      };
    };
    family?: string;
    name?: string;
    refs?: {
      ref?: NvtRefElement | NvtRefElement[];
    };
    severities?: NvtSeveritiesElement;
    solution?: {
      __text?: string;
      _type?: string;
    };
    tags?: string;
    type?: 'cve' | 'nvt';
  };
  original_severity?: string; // only for delta reports
  original_threat?: string; // only for delta reports
  port?: string;
  qod?: QoDParams;
  scan_nvt_version?: string;
  severity?: number;
  threat?: string;
}

export interface ReportResultsElement {
  _max?: string;
  _start?: string;
  result?: ReportResultElement | ReportResultElement[];
}

export interface ReportComplianceCountElement {
  __text?: number;
  full?: number;
  filtered?: number;
  yes?: {
    full?: number;
    filtered?: number;
  };
  no?: {
    full?: number;
    filtered?: number;
  };
  incomplete?: {
    full?: number;
    filtered?: number;
  };
  undefined?: {
    full?: number;
    filtered?: number;
  };
}

export interface ReportResultCountElement {
  __text?: string;
  false_positive?: {
    filtered?: number;
    full?: number;
  };
  full?: number;
  filtered?: number;
  high?: {
    filtered?: number;
    full?: number;
  };
  holes?: {
    _deprecated: '1';
    filtered?: number;
    full?: number;
  };
  info?: {
    _deprecated: '1';
    filtered?: number;
    full?: number;
  };
  log?: {
    filtered?: number;
    full?: number;
  };
  low?: {
    filtered?: number;
    full?: number;
  };
  medium?: {
    filtered?: number;
    full?: number;
  };
  warning?: {
    _deprecated: '1';
    filtered?: number;
    full?: number;
  };
}

interface ResultsReportElement {
  results?: ReportResultsElement;
  result_count?: ReportResultCountElement;
  compliance_count?: ReportComplianceCountElement;
}

export interface TlsCertificatesElement {
  tls_certificate?: ReportTLSCertificateElement | ReportTLSCertificateElement[];
}

interface TlsCertificatesReportElement {
  ssl_certs?: CountElement;
  tls_certificates?: TlsCertificatesElement;
}

interface PortElement {
  __text?: string;
  host?: string;
  severity?: number;
  threat?: string;
}

export interface PortsElement extends CountElement {
  _max?: string;
  _min?: string;
  port?: PortElement | PortElement[];
}

interface PortsReportElement {
  ports?: PortsElement;
}

interface PageCountElement {
  __text?: number;
  page?: number;
}

export interface ReportHostElement {
  asset?: {
    _asset_id?: string;
  };
  compliance_count?: {
    // only for compliance reports
    page?: number;
    yes?: PageCountElement;
    no?: PageCountElement;
    incomplete?: PageCountElement;
    undefined?: PageCountElement;
  };
  detail?: {
    name?: string;
    source?: {
      description?: string;
      name?: string;
    };
    value?: string | number;
    extra?: number; // only for closed cves. contains severity
  }[];
  end?: string; // date
  ip?: string;
  host_compliance?: ComplianceType; // only for compliance reports
  port_count?: {
    page?: number;
  };
  result_count?: {
    page?: number;
    false_positive?: PageCountElement;
    high?: PageCountElement;
    hole?: {
      __text?: number;
      _deprecated: '1';
      page?: number;
    };
    info?: {
      __text?: number;
      _deprecated: '1';
      page?: number;
    };
    log?: PageCountElement;
    low?: PageCountElement;
    medium?: PageCountElement;
    warning?: {
      __text?: number;
      _deprecated: '1';
      page?: number;
    };
  };
  start?: string; // date
}

interface AppsReportElement {
  host?: ReportHostElement | ReportHostElement[];
  apps?: CountElement;
  results?: ReportResultsElement;
}

interface OperatingSystemReportElement {
  host?: ReportHostElement | ReportHostElement[];
  results?: ReportResultsElement;
  os?: CountElement;
}

interface ErrorsReportElement {
  host?: ReportHostElement | ReportHostElement[];
  errors?: ErrorsElement;
}

interface ClosedCvesReportElement {
  host?: ReportHostElement | ReportHostElement[];
  closed_cves?: CountElement;
}

interface CvesReportElement {
  results?: ReportResultsElement;
}

export interface ReportClosedCve {
  id: string;
  cveId: string;
  host: {
    ip?: string;
    id?: string;
    name?: string;
  };
  source?: {
    description?: string;
    name?: string;
  };
  severity?: number;
}

export interface ReportError {
  id?: string;
  description?: string;
  host?: {
    ip?: string;
    name?: string;
    id?: string;
  };
  nvt: {
    id?: string;
    name?: string;
  };
  port?: string;
}

interface HostsReportElement {
  host?: ReportHostElement | ReportHostElement[];
  results?: ReportResultsElement;
  hosts?: CountElement;
}

// reports with details=1 always have a results element
// (that can be empty) whereas reports with details=0
// never have a results element
const isReportWithDetails = (results: ReportResultsElement | undefined) =>
  isDefined(results);

export const emptyCollectionList = (filter: Filter) => {
  return {
    filter,
    entities: [],
    counts: new CollectionCounts(),
  };
};

export const parseTlsCertificates = (
  report: TlsCertificatesReportElement,
  filter: Filter,
): CollectionList<ReportTLSCertificate> => {
  const {ssl_certs, tls_certificates} = report;

  if (!isDefined(ssl_certs) || !isDefined(tls_certificates)) {
    return emptyCollectionList(filter);
  }

  const {count: fullCount} = ssl_certs;

  const certs = map(tls_certificates.tls_certificate, tlsCert =>
    ReportTLSCertificate.fromElement(tlsCert),
  );

  // create a cert per port
  const certsPerPort: ReportTLSCertificate[] = [];
  certs.forEach(cert => {
    cert.ports.forEach(port => {
      certsPerPort.push(cert.copy({port, ports: [port]}));
    });
  });

  const {length: filteredCount} = certsPerPort;

  const counts = new CollectionCounts({
    all: fullCount,
    filtered: filteredCount,
    first: 1,
    length: filteredCount,
    rows: filteredCount,
  });

  return {
    counts,
    entities: certsPerPort,
    filter,
  };
};

export const parsePorts = (
  report: PortsReportElement,
  filter: Filter,
): CollectionList<ReportPort> => {
  const tempPorts: Record<string, ReportPort> = {};
  const {ports} = report;

  if (!isDefined(ports)) {
    return emptyCollectionList(filter);
  }

  const {count: fullCount} = ports;

  forEach(ports.port, port => {
    const {__text: id} = port;

    if (isDefined(id) && !id.startsWith('general')) {
      let tPort = tempPorts[id];

      if (isDefined(tPort)) {
        const severity = parseSeverity(port.severity);

        tPort.setSeverity(severity);
      } else {
        tPort = ReportPort.fromElement(port);
        tempPorts[id] = tPort;
      }

      tPort.addHost({ip: port.host});
    }
  });

  const portsArray = Object.values(tempPorts);
  const {length: filteredCount} = portsArray;

  const counts = new CollectionCounts({
    all: fullCount,
    filtered: filteredCount,
    first: 1,
    length: filteredCount,
    rows: filteredCount,
  });

  return {
    entities: portsArray.sort((portA, portB) =>
      Number(portA.number > portB.number),
    ),
    filter,
    counts,
  };
};

export const parseApps = (
  report: AppsReportElement,
  filter: Filter,
): CollectionList<ReportApp> => {
  const {host: hosts, apps, results} = report;
  if (!isDefined(apps) || !isReportWithDetails(results)) {
    return emptyCollectionList(filter);
  }

  const {count: fullCount} = apps;
  const severities = {};
  const tempApps: Record<string, ReportApp> = {};
  const cpeHostDetails: Record<string, number> = {};

  // if there are several results find the highest severity for the cpe
  forEach(results.result, result => {
    const resultSeverity = parseSeverity(result.severity);

    if (
      isDefined(resultSeverity) &&
      isDefined(result.detection?.result?.details)
    ) {
      filterFunc(
        result.detection.result.details.detail,
        detail => detail.name === 'product',
      ).forEach(detail => {
        const {value: cpe} = detail;

        if (isDefined(cpe)) {
          const severity = severities[cpe];

          if (isDefined(severity)) {
            if (severity < resultSeverity) {
              severities[cpe] = resultSeverity;
            }
          } else {
            severities[cpe] = resultSeverity;
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
        const cpe = detail.value as string;
        let app = tempApps[cpe];

        if (!isDefined(app)) {
          app = ReportApp.fromElement({
            value: detail.value as string,
            severity: severities[cpe],
          });
          tempApps[cpe] = app;
        }

        app.addHost(host);
      } else if (name.startsWith('cpe:/a')) {
        const detailsCountForCpe = cpeHostDetails[name];

        if (isDefined(detailsCountForCpe)) {
          cpeHostDetails[name] += 1;
        } else {
          cpeHostDetails[name] = 1;
        }
      }
    });
  });

  const appsArray = Object.values(tempApps);

  // Collect host and occurrence counts
  for (const app of appsArray) {
    const details_count_for_cpe = cpeHostDetails[app.id as string];
    app.addOccurrence(details_count_for_cpe);
  }

  const {length: filteredCount} = appsArray;

  const counts = new CollectionCounts({
    all: fullCount,
    filtered: filteredCount,
    first: 1,
    length: filteredCount,
    rows: filteredCount,
  });

  return {
    filter,
    entities: appsArray,
    counts,
  };
};

export const parseHostSeverities = (results: ReportResultsElement = {}) => {
  const severities: Record<string, number> = {};

  // if the there are several results find the highest severity for the ip
  forEach(results.result, result => {
    const {host} = result;
    const ip = host?.__text;

    if (isDefined(ip) && isDefined(result.severity)) {
      const resultSeverity = parseSeverity(result.severity) as number;
      const severity = severities[ip];

      if (isDefined(severity)) {
        if (severity < resultSeverity) {
          severities[ip] = resultSeverity;
        }
      } else {
        severities[ip] = resultSeverity;
      }
    }
  });

  return severities;
};

export const parseOperatingSystems = (
  report: OperatingSystemReportElement,
  filter: Filter,
): CollectionList<ReportOperatingSystem> => {
  const {host: hosts, results, os: osCount} = report;

  if (!isDefined(osCount) || !isReportWithDetails(results)) {
    return emptyCollectionList(filter);
  }

  const operatingSystems: Record<string, ReportOperatingSystem> = {};

  const severities = parseHostSeverities(results);

  forEach(hosts, host => {
    const {detail: details, ip, host_compliance} = host;

    let bestOsCpe: string | undefined;
    let bestOsTxt: string | undefined;

    if (isDefined(ip)) {
      forEach(details, detail => {
        const {name, value} = detail;
        if (name === 'best_os_cpe') {
          bestOsCpe = value as string;
        } else if (name === 'best_os_txt') {
          bestOsTxt = value as string;
        }
      });

      if (isDefined(bestOsCpe)) {
        let os = operatingSystems[bestOsCpe];
        const severity = severities[ip];

        if (!isDefined(os)) {
          os = ReportOperatingSystem.fromElement({
            best_os_cpe: bestOsCpe,
            best_os_txt: bestOsTxt,
          });
          operatingSystems[bestOsCpe] = os;
        }

        os.addHost(host);
        os.setSeverity(severity);
        os.addHostCompliance(host, host_compliance);
      }
    }
  });

  const osArray = Object.values(operatingSystems);
  const {length: filteredCount} = osArray;

  const counts = new CollectionCounts({
    all: osCount.count,
    filtered: filteredCount,
    first: 1,
    length: filteredCount,
    rows: filteredCount,
  });

  return {
    filter,
    entities: osArray,
    counts,
  };
};

export const parseHosts = (
  report: HostsReportElement,
  filter: Filter,
): CollectionList<ReportHost> => {
  const {host: hosts, results, hosts: hostsCount} = report;

  if (
    (!isDefined(hosts) && !isDefined(hostsCount)) ||
    !isReportWithDetails(results)
  ) {
    return emptyCollectionList(filter);
  }

  const severities = parseHostSeverities(results);

  const hostsArray = map(hosts, host => {
    const severity = severities[host.ip as string];
    return ReportHost.fromElement({
      ...host,
      severity,
    });
  });

  const {length: filteredCount} = hostsArray;

  const counts = new CollectionCounts({
    all: hostsCount?.count,
    filtered: filteredCount,
    first: 1,
    length: filteredCount,
    rows: filteredCount,
  });

  return {
    counts,
    entities: hostsArray,
    filter,
  };
};

const parseReportReportCounts = (element: ResultsReportElement) => {
  const resultsElement = element.results ?? {};
  const resultCountElement = element.result_count ?? element.compliance_count;

  // due to the XML conversion to JS the result element can be a single element or an array
  const length = isDefined(resultsElement.result)
    ? isArray(resultsElement.result)
      ? resultsElement.result.length
      : 1
    : 0;

  return new CollectionCounts({
    first: resultsElement._start,
    rows: resultCountElement?.filtered,
    length,
    all: isDefined(resultCountElement?.full)
      ? resultCountElement.full
      : resultCountElement?.filtered, // ec.full isn't available for delta reports
    filtered: resultCountElement?.filtered,
  });
};

export const parseResults = (report: ResultsReportElement) => {
  const {results, result_count, compliance_count} = report;
  if (
    !isDefined(results) &&
    !isDefined(result_count) &&
    !isDefined(compliance_count)
  ) {
    return undefined;
    // instead of returning empty_collection_list(filter) we return an undefined
    // in order to query if results have been loaded and make a difference to
    // "loaded, but 0 total". This is used for showing the Loading indicator at
    // the report details
  }

  return parseCollectionList<Result, Required<ResultsReportElement>>(
    report as Required<ResultsReportElement>,
    'result',
    Result,
    {
      entitiesParseFunc: parseReportResultEntities<
        Result,
        Required<ResultsReportElement>
      >,
      collectionCountParseFunc: parseReportReportCounts,
    },
  );
};

export const parseErrors = (
  report: ErrorsReportElement,
  filter: Filter,
): CollectionList<ReportError> => {
  const {host: hosts, errors} = report;

  if (!isDefined(errors)) {
    return emptyCollectionList(filter);
  }

  const {count: fullCount} = errors;

  const hostnamesByIp = {};

  forEach(hosts, host => {
    const {ip} = host;

    if (isDefined(ip)) {
      forEach(host.detail, detail => {
        const {name, value} = detail;
        if (name === 'hostname') {
          // collect hostname
          hostnamesByIp[ip] = value;
        }
      });
    }
  });

  const errorsArray = filterFunc(
    errors.error,
    error => isDefined(error.host) && isDefined(error.nvt),
  ).map(error => {
    const {host, description, port, nvt} = error;
    const ip = host?.__text as string;
    const asset = host?.asset;
    const hostname = hostnamesByIp[ip];
    return {
      id: `${ip}:${nvt?._oid}`, // unique id for react key
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
        id: nvt?._oid,
        name: nvt?.name,
      },
      port,
    };
  });

  const filteredCount = errorsArray.length;

  const counts = new CollectionCounts({
    all: fullCount,
    filtered: filteredCount,
    first: 1,
    length: filteredCount,
    rows: filteredCount,
  });

  return {
    counts,
    entities: errorsArray,
    filter,
  };
};

export const parseClosedCves = (
  report: ClosedCvesReportElement,
  filter: Filter,
): CollectionList<ReportClosedCve> => {
  const {host: hosts, closed_cves: closedCves} = report;

  if (!isDefined(closedCves)) {
    return emptyCollectionList(filter);
  }

  // count doesn't fit to our counting of cves. we split the db rows with a csv
  // list of cves into several cves.
  // const {count: full_count} = closed_cves;

  let cvesArray: ReportClosedCve[] = [];

  forEach(hosts, host => {
    let hostname: string | undefined;
    const hostCves: Record<string, ReportClosedCve> = {};

    forEach(host.detail, detail => {
      const {name, value = '', extra, source} = detail;

      if (isDefined(name)) {
        if (name.startsWith('Closed CVE')) {
          const cveHost = {
            ip: host.ip,
            id: isDefined(host.asset) ? host.asset._asset_id : undefined,
          };
          const severity = parseSeverity(extra);
          (value as string).split(',').forEach(val => {
            const cveId = val.trim();
            const cve: ReportClosedCve = {
              id: `${cveId}-${host.ip}-${source?.name}`,
              cveId,
              host: cveHost,
              source,
              severity,
            };

            const existingCve = hostCves[cveId];
            if (
              isDefined(existingCve) &&
              isDefined(existingCve.severity) &&
              (!isDefined(cve.severity) || existingCve.severity > cve.severity)
            ) {
              // always use highest severity
              cve.severity = existingCve.severity;
            }

            hostCves[cveId] = cve;
          });
        } else if (name === 'hostname') {
          // collect hostname
          hostname = value as string | undefined;
        }
      }
    });

    if (isDefined(hostname)) {
      for (const cve of Object.values(hostCves)) {
        cve.host.name = hostname;
      }
    }

    cvesArray = cvesArray.concat(Object.values(hostCves));
  });

  const {length: filteredCount} = cvesArray;

  const counts = new CollectionCounts({
    all: closedCves.count,
    filtered: filteredCount,
    first: 1,
    length: filteredCount,
    rows: filteredCount,
  });

  return {
    counts,
    entities: cvesArray,
    filter,
  };
};

export const parseCves = (
  report: CvesReportElement,
  filter: Filter,
): CollectionList<ReportCve> => {
  const {results} = report;

  if (!isDefined(results)) {
    return emptyCollectionList(filter);
  }

  const cves: Record<string, ReportCve> = {};

  const resultsWithCve = filterFunc(results.result, result => {
    const refs = getRefs(result.nvt);
    return refs.some(hasRefType('cve'));
  });

  resultsWithCve.forEach(result => {
    const {host = {}, nvt} = result;
    const id = nvt?._oid as string;
    let cve = cves[id];

    if (!isDefined(cve)) {
      cve = ReportCve.fromElement({nvt});
      cves[id] = cve;
    }

    const {__text: ip} = host;

    if (isDefined(ip)) {
      cve.addHost({ip});
    }
    cve.addResult(result);
  });

  const cvesArray = Object.values(cves);

  const {length: filteredCount} = cvesArray;

  const counts = new CollectionCounts({
    all: filteredCount,
    filtered: filteredCount,
    first: 1,
    length: filteredCount,
    rows: filteredCount,
  });

  return {
    counts,
    entities: cvesArray,
    filter,
  };
};

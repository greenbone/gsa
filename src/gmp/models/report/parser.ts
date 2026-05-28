/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import CollectionCounts from 'gmp/collection/collection-counts';
import {type CollectionList} from 'gmp/collection/parser';
import {type ComplianceType} from 'gmp/models/compliance';
import type Filter from 'gmp/models/filter';
import {type NvtRefElement, type NvtSeveritiesElement} from 'gmp/models/nvt';
import {type ReportTLSCertificateElement} from 'gmp/models/report/tls-certificate';
import {parseSeverity, type QoDParams} from 'gmp/parser';
import {filter as filterFunc, forEach} from 'gmp/utils/array';
import {isDefined} from 'gmp/utils/identity';
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

export interface ReportResultElement {
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
  critical?: {
    filtered?: number;
    full?: number;
  };
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

export interface TlsCertificatesElement {
  tls_certificate?: ReportTLSCertificateElement | ReportTLSCertificateElement[];
}

export interface PortElement {
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

interface PageCountElement {
  __text?: number;
  page?: number;
}

interface ReportHostDetailElement {
  name?: string;
  source?: {
    description?: string;
    name?: string;
  };
  value?: string | number;
  extra?: number; // only for closed cves. contains severity
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
  detail?: ReportHostDetailElement[];
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

export interface AppsReportElement {
  host?: ReportHostElement | ReportHostElement[];
  apps?: CountElement;
  results?: ReportResultsElement;
}

interface ErrorsReportElement {
  host?: ReportHostElement | ReportHostElement[];
  errors?: ErrorsElement;
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

export interface ReportActiveCve {
  id: string;
  cveId: string;
  host: {
    ip?: string;
    id?: string;
    name?: string;
  };
  source?: {
    name?: string;
    description?: string;
  };
  severity?: number;
}

// Single element shape shared by both active and closed CVE endpoints.
// Active CVEs use `name` for the CVE ID; closed CVEs use `cve`.
export interface CveEndpointElement {
  host?: string;
  cve?: string;
  name?: string;
  nvt?: {
    _oid?: string;
    name?: string;
    __text?: string;
  };
  severity?: string | number;
  threat?: string;
}

interface CveEndpointContainer {
  count?: number;
  _count?: number;
}

interface CvesEndpointContainer extends CveEndpointContainer {
  cve?: CveEndpointElement | CveEndpointElement[];
}

export interface CvesEndpointData {
  cves?: CvesEndpointContainer;
  [key: string]: unknown;
}

interface ClosedCvesEndpointContainer extends CveEndpointContainer {
  closed_cve?: CveEndpointElement | CveEndpointElement[];
}

export interface ClosedCvesEndpointData {
  closed_cves?: ClosedCvesEndpointContainer;
  [key: string]: unknown;
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

// reports with details=1 always have a results element
// (that can be empty) whereas reports with details=0
// never have a results element
export const emptyCollectionList = (filter: Filter) => {
  return {
    filter,
    entities: [],
    counts: new CollectionCounts(),
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

const parseCveEndpointElements = (
  elements: CveEndpointElement | CveEndpointElement[] | undefined,
  idField: 'name' | 'cve',
): ReportClosedCve[] => {
  const entities: ReportClosedCve[] = [];

  forEach(elements, el => {
    const cveId = el[idField];
    const ip = el.host;
    const nvtOid = el.nvt?._oid;
    const nvtName = el.nvt?.name ?? el.nvt?.__text;
    const severity = parseSeverity(el.severity);

    if (isDefined(cveId)) {
      entities.push({
        id: `${cveId}-${ip}-${nvtOid}`,
        cveId,
        host: {ip},
        source: {name: nvtOid, description: nvtName},
        severity,
      });
    }
  });

  return entities;
};

const buildCveCollectionList = (
  entities: ReportClosedCve[],
  container: CveEndpointContainer,
  filter: Filter,
): CollectionList<ReportClosedCve> => {
  const {length: filteredCount} = entities;

  return {
    entities,
    filter,
    counts: new CollectionCounts({
      all: container.count ?? container._count ?? filteredCount,
      filtered: filteredCount,
      first: 1,
      length: filteredCount,
      rows: filteredCount,
    }),
  };
};

export const parseCvesFromEndpoint = (
  data: CvesEndpointData,
  filter: Filter,
): CollectionList<ReportActiveCve> => {
  const {cves: cvesContainer} = data;

  if (!isDefined(cvesContainer)) {
    return emptyCollectionList(filter);
  }

  const entities = parseCveEndpointElements(cvesContainer.cve, 'name');

  return buildCveCollectionList(entities, cvesContainer, filter);
};

export const parseClosedCvesFromEndpoint = (
  data: ClosedCvesEndpointData,
  filter: Filter,
): CollectionList<ReportClosedCve> => {
  const {closed_cves: closedCvesContainer} = data;

  if (!isDefined(closedCvesContainer)) {
    return emptyCollectionList(filter);
  }

  const entities = parseCveEndpointElements(
    closedCvesContainer.closed_cve,
    'cve',
  );

  return buildCveCollectionList(entities, closedCvesContainer, filter);
};

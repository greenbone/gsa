/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {COMPLIANCE, type ComplianceType} from 'gmp/models/compliance';
import {type Date} from 'gmp/models/date';
import {parseInt, parseDate, parseSeverity} from 'gmp/parser';
import {isArray, isDefined} from 'gmp/utils/identity';
import {isEmpty} from 'gmp/utils/string';

interface PageCountElement {
  page?: number;
}

interface HostDetails {
  agentId?: string;
  best_os_cpe?: string;
  best_os_txt?: string;
  distance?: number;
  appsCount?: number;
}

interface HostElement {
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
  }[];
  end?: string; // date
  ip?: string;
  host_compliance?: ComplianceType; // only for compliance reports
  port_count?: {
    page?: number;
  };
  result_count?: {
    page?: number;
    critical?: PageCountElement;
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

interface HostElementWithSeverity extends HostElement {
  severity?: number;
}

interface ComplianceCounts {
  yes: number;
  no: number;
  incomplete: number;
  undefined?: number;
  total: number;
}

interface ResultCounts {
  critical?: number;
  high: number;
  medium: number;
  low: number;
  log: number;
  false_positive: number;
  total: number;
}

interface HostProperties {
  asset?: {
    id?: string;
  };
  authSuccess?: Record<string, boolean>;
  complianceCounts?: ComplianceCounts;
  details?: HostDetails;
  end?: Date;
  hostCompliance?: ComplianceType;
  hostname?: string;
  id?: string; // use ip as id
  ip?: string;
  portsCount?: number;
  result_counts?: ResultCounts;
  severity?: number;
  start?: Date;
}

const parseCount = (value?: number | string) => {
  const parsed = parseInt(value);
  return isDefined(parsed) ? parsed : 0;
};

const parsePageCount = (value?: {page?: number | string}) =>
  parseCount(value?.page);

class ReportHost {
  readonly asset?: {
    id?: string;
  };
  readonly authSuccess: Record<string, boolean>;
  readonly complianceCounts: ComplianceCounts;
  readonly details?: HostDetails;
  readonly end?: Date;
  readonly hostCompliance: ComplianceType;
  readonly hostname?: string;
  readonly id?: string;
  readonly ip?: string;
  readonly portsCount: number;
  readonly result_counts: ResultCounts;
  readonly severity?: number;
  readonly start?: Date;

  constructor({
    asset,
    authSuccess,
    complianceCounts,
    details,
    end,
    hostCompliance = COMPLIANCE.UNDEFINED,
    hostname,
    id,
    ip,
    portsCount = 0,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    result_counts,
    severity,
    start,
  }: HostProperties = {}) {
    this.asset = asset;
    this.authSuccess = authSuccess ?? {};
    this.complianceCounts = complianceCounts ?? {
      yes: 0,
      no: 0,
      incomplete: 0,
      total: 0,
      undefined: 0,
    };
    this.details = details ?? {};
    this.end = end;
    this.hostCompliance = hostCompliance;
    this.hostname = hostname;
    this.id = id;
    this.ip = ip;
    this.portsCount = portsCount;
    this.result_counts = result_counts ?? {
      critical: 0,
      false_positive: 0,
      high: 0,
      medium: 0,
      log: 0,
      low: 0,
      total: 0,
    };
    this.severity = severity;
    this.start = start;
  }

  static fromElement(element: HostElementWithSeverity = {}): ReportHost {
    return new ReportHost(this.parseElement(element));
  }

  static parseElement(element: HostElementWithSeverity = {}): HostProperties {
    const copy = {} as HostProperties;

    const {
      asset = {},
      port_count = {},
      result_count,
      compliance_count,
      host_compliance,
    } = element;

    copy.hostCompliance = isDefined(host_compliance)
      ? host_compliance
      : 'undefined';

    if (!isEmpty(asset._asset_id)) {
      copy.asset = {
        id: asset._asset_id,
      };
    }

    copy.portsCount = parsePageCount(port_count);

    if (isDefined(result_count)) {
      copy.result_counts = {
        critical: parsePageCount(result_count.critical),
        high: parsePageCount(result_count.high),
        medium: parsePageCount(result_count.medium),
        low: parsePageCount(result_count.low),
        log: parsePageCount(result_count.log),
        false_positive: parsePageCount(result_count.false_positive),
        total: parsePageCount(result_count),
      };
    } else {
      copy.result_counts = {
        critical: 0,
        high: 0,
        medium: 0,
        low: 0,
        log: 0,
        false_positive: 0,
        total: 0,
      };
    }

    if (isDefined(compliance_count)) {
      copy.complianceCounts = {
        yes: parsePageCount(compliance_count.yes),
        no: parsePageCount(compliance_count.no),
        incomplete: parsePageCount(compliance_count.incomplete),
        undefined: parsePageCount(compliance_count.undefined),
        total: parsePageCount(compliance_count),
      };
    } else {
      copy.complianceCounts = {
        yes: 0,
        no: 0,
        incomplete: 0,
        undefined: 0,
        total: 0,
      };
    }

    copy.start = parseDate(element.start);
    copy.end = parseDate(element.end);

    const authSuccess: Record<string, boolean> = {};
    const hostDetails: HostDetails = {};

    if (isArray(element.detail)) {
      let appsCount = 0;
      element.detail.forEach(details => {
        const {name, value} = details;
        switch (name) {
          case 'hostname':
            copy.hostname = value as string;
            break;
          case 'best_os_cpe':
            hostDetails.best_os_cpe = value as string;
            break;
          case 'best_os_txt':
            hostDetails.best_os_txt = value as string;
            break;
          case 'traceroute':
            hostDetails.distance = (value as string).split(',').length - 1;
            break;
          case 'App':
            appsCount++;
            break;
          case 'agentID':
            hostDetails.agentId = value as string;
            break;
          default:
            break;
        }
        if (name?.startsWith('Auth')) {
          const authArray = name.split('-');
          const authName = authArray[1].toLowerCase();
          if (authSuccess[authName] !== true) {
            authSuccess[authName] = authArray[2] === 'Success';
          }
        }
        hostDetails.appsCount = appsCount;
      });
    }

    copy.details = hostDetails;
    copy.id = element.ip; // use ip as id. we need an id for react key prop
    copy.ip = element.ip;
    copy.authSuccess = authSuccess;
    copy.severity = parseSeverity(element.severity);

    return copy;
  }
}

export default ReportHost;

/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type Filter from 'gmp/models/filter';
import Model, {type ModelElement, type ModelProperties} from 'gmp/models/model';
import {
  parseApps,
  parseClosedCves,
  parseHosts,
  parseOperatingSystems,
  type CountElement,
  type ReportHostElement,
  type ReportResultElement,
} from 'gmp/models/report/parser';
import type Result from 'gmp/models/result';
import {isDefined} from 'gmp/utils/identity';

interface ReportHostCountElement {
  __text?: number;
  filtered?: number;
  page?: number;
}

interface ReportHostsWindowElement {
  _start?: string;
  _max?: string;
}

export interface ReportHostsResponseElement extends ModelElement {
  host?: ReportHostElement | ReportHostElement[];
  report_hosts?: ReportHostsWindowElement;
  report_host_count?: ReportHostCountElement;
  filters?: unknown;
  sort?: unknown;
  _status?: string;
  _status_text?: string;
}

interface ReportHostsResponseProperties extends ModelProperties {
  host?: ReportHostElement | ReportHostElement[];
  report_hosts?: ReportHostsWindowElement;
  report_host_count?: ReportHostCountElement;
  filters?: unknown;
  sort?: unknown;
  _status?: string;
  _status_text?: string;
}

const asArray = <T>(value?: T | T[]): T[] => {
  if (!isDefined(value)) {
    return [];
  }

  return Array.isArray(value) ? value : [value];
};

class ReportHostsResponse extends Model {
  static readonly entityType = 'reporthost';

  readonly host?: ReportHostElement | ReportHostElement[];
  readonly report_hosts?: ReportHostsWindowElement;
  readonly report_host_count?: ReportHostCountElement;
  readonly filters?: unknown;
  readonly sort?: unknown;
  readonly _status?: string;
  readonly _status_text?: string;

  constructor({
    host,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    report_hosts,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    report_host_count,
    filters,
    sort,
    _status,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    _status_text,
    ...properties
  }: ReportHostsResponseProperties = {}) {
    super(properties);

    this.host = host;
    this.report_hosts = report_hosts;
    this.report_host_count = report_host_count;
    this.filters = filters;
    this.sort = sort;
    this._status = _status;
    this._status_text = _status_text;
  }

  static fromElement(
    element: ReportHostsResponseElement = {},
  ): ReportHostsResponse {
    return new ReportHostsResponse(this.parseElement(element));
  }

  static parseElement(
    element: ReportHostsResponseElement = {},
  ): ReportHostsResponseProperties {
    const copy = super.parseElement(element) as ReportHostsResponseProperties;

    copy.host = isDefined(element.host) ? element.host : undefined;
    copy.report_hosts = isDefined(element.report_hosts)
      ? element.report_hosts
      : undefined;
    copy.report_host_count = isDefined(element.report_host_count)
      ? element.report_host_count
      : undefined;
    copy.filters = element.filters;
    copy.sort = element.sort;
    copy._status = element._status;
    copy._status_text = element._status_text;

    return copy;
  }

  private toReportResultElements(
    results: Result[] = [],
  ): ReportResultElement[] {
    return results.map(result => ({
      host: isDefined(result.host?.name)
        ? {
            __text: result.host.name,
            asset: isDefined(result.host?.id)
              ? {_asset_id: result.host.id}
              : undefined,
            hostname: result.host.hostname,
          }
        : undefined,
      severity: result.severity,
      detection: isDefined(result.detection?.result)
        ? {
            result: {
              _id: result.detection.result.id,
              details: {
                detail: Object.entries(
                  result.detection.result.details ?? {},
                ).map(([name, value]) => ({
                  name,
                  value,
                })),
              },
            },
          }
        : undefined,
      nvt:
        isDefined(result.information) && 'id' in result.information
          ? {
              _oid: result.information.id,
              name: result.information.name,
            }
          : undefined,
      port: result.port,
      scan_nvt_version: result.scan_nvt_version,
      description: result.description,
      compliance: result.compliance,
      threat: undefined,
    }));
  }

  private getHostCountElement(): CountElement | undefined {
    const count =
      this.report_host_count?.filtered ?? this.report_host_count?.__text;

    return isDefined(count) ? {count} : undefined;
  }

  private getAppCountElement(): CountElement {
    const count = new Set(
      asArray(this.host).flatMap(host =>
        asArray(host.detail)
          .filter(detail => detail.name === 'App' && isDefined(detail.value))
          .map(detail => String(detail.value)),
      ),
    ).size;

    return {count};
  }

  private getOperatingSystemCountElement(): CountElement {
    const count = new Set(
      asArray(this.host)
        .map(
          host =>
            asArray(host.detail).find(detail => detail.name === 'best_os_cpe')
              ?.value,
        )
        .filter(isDefined)
        .map(value => String(value)),
    ).size;

    return {count};
  }

  private getClosedCveCountElement(): CountElement {
    const count = asArray(this.host).reduce((total, host) => {
      const hostCount = asArray(host.detail).reduce((sum, detail) => {
        if (
          isDefined(detail.name) &&
          detail.name.startsWith('Closed CVE') &&
          isDefined(detail.value)
        ) {
          return (
            sum +
            String(detail.value)
              .split(',')
              .map(value => value.trim())
              .filter(Boolean).length
          );
        }

        return sum;
      }, 0);

      return total + hostCount;
    }, 0);

    return {count};
  }

  private toParserReport(results: Result[] = []) {
    return {
      host: this.host,
      hosts: this.getHostCountElement(),
      apps: this.getAppCountElement(),
      os: this.getOperatingSystemCountElement(),
      closed_cves: this.getClosedCveCountElement(),
      results: {
        result: this.toReportResultElements(results),
      },
    };
  }

  toHostsCollection(filter: Filter, results: Result[] = []) {
    return parseHosts(this.toParserReport(results), filter);
  }

  toAppsCollection(filter: Filter, results: Result[] = []) {
    return parseApps(this.toParserReport(results), filter);
  }

  toOperatingSystemsCollection(filter: Filter, results: Result[] = []) {
    return parseOperatingSystems(this.toParserReport(results), filter);
  }

  toClosedCvesCollection(filter: Filter) {
    return parseClosedCves(
      {
        host: this.host,
        closed_cves: this.getClosedCveCountElement(),
      },
      filter,
    );
  }
}

export default ReportHostsResponse;

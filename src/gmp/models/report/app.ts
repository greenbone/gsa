/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {parseInt, parseSeverity} from 'gmp/parser';
import {isDefined} from 'gmp/utils/identity';

interface AppElement {
  name?: string;
  severity?: number | string;
  hosts_count?: number | string;
  occurrences?: number | string;
}

interface AppProperties {
  id?: string;
  name?: string;
  severity?: number;
  hostsCount?: number;
  occurrencesTotal?: number;
}

class ReportApp {
  readonly id?: string;
  readonly name?: string;
  readonly severity?: number;
  readonly hosts: {
    count: number;
  };
  readonly occurrences: {
    total: number;
  };

  constructor({
    id,
    name,
    severity,
    hostsCount = 0,
    occurrencesTotal = 0,
  }: AppProperties = {}) {
    this.id = id;
    this.name = name;
    this.severity = severity;
    this.hosts = {
      count: hostsCount,
    };
    this.occurrences = {
      total: occurrencesTotal,
    };
  }

  static fromElement(element: AppElement = {}): ReportApp {
    return new ReportApp(this.parseElement(element));
  }

  static parseElement(element: AppElement = {}): AppProperties {
    const copy: AppProperties = {};

    const {name: cpe} = element;

    copy.id = cpe;
    copy.name = cpe;

    copy.severity = parseSeverity(element.severity);

    const hostsCount = parseInt(element.hosts_count);
    if (isDefined(hostsCount)) {
      copy.hostsCount = hostsCount;
    }

    const occurrencesTotal = parseInt(element.occurrences);
    if (isDefined(occurrencesTotal)) {
      copy.occurrencesTotal = occurrencesTotal;
    }

    return copy;
  }
}

export default ReportApp;

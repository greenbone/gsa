/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Model, {type ModelElement, type ModelProperties} from 'gmp/models/model';
import {parseInt, parseSeverity} from 'gmp/parser';

interface OperatingSystemElement extends ModelElement {
  os?: {
    all_installs?: number;
    average_severity?: {
      value?: number;
    };
    highest_severity?: {
      value?: number;
    };
    installs?: number;
    hosts?: {
      __text?: string | number;
      asset?: {
        _id?: string;
        name?: string;
        severity?: {
          value?: string;
        };
      };
    };
    latest_severity?: {
      value?: number;
    };
    title?: string;
  };
}

interface OperatingSystemProperties extends ModelProperties {
  averageSeverity?: number;
  highestSeverity?: number;
  latestSeverity?: number;
  title?: string;
  hosts?: number;
  allHosts?: number;
}

class OperatingSystem extends Model {
  static readonly entityType = 'operatingsystem';

  readonly averageSeverity?: number;
  readonly highestSeverity?: number;
  readonly latestSeverity?: number;
  readonly title?: string;
  readonly hosts?: number;
  readonly allHosts?: number;

  constructor({
    averageSeverity,
    highestSeverity,
    latestSeverity,
    title,
    hosts,
    allHosts,
    ...properties
  }: OperatingSystemProperties = {}) {
    super(properties);

    this.averageSeverity = averageSeverity;
    this.highestSeverity = highestSeverity;
    this.latestSeverity = latestSeverity;
    this.title = title;
    this.hosts = hosts;
    this.allHosts = allHosts;
  }

  static fromElement(element?: OperatingSystemElement): OperatingSystem {
    return new OperatingSystem(this.parseElement(element));
  }

  static parseElement(
    element: OperatingSystemElement = {},
  ): OperatingSystemProperties {
    const ret = super.parseElement(element) as OperatingSystemProperties;

    if (element.os) {
      ret.averageSeverity = parseSeverity(element.os?.average_severity?.value);
      ret.latestSeverity = parseSeverity(element.os?.latest_severity?.value);
      ret.highestSeverity = parseSeverity(element.os?.highest_severity?.value);

      ret.title = element.os.title;
      ret.hosts = parseInt(element.os.installs);
      ret.allHosts = parseInt(element.os.all_installs);
    }

    return ret;
  }
}

export default OperatingSystem;

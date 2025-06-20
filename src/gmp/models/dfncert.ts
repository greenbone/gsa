/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Model, {ModelElement, ModelProperties} from 'gmp/models/model';
import {parseSeverity} from 'gmp/parser';
import {forEach, map} from 'gmp/utils/array';
import {isDefined} from 'gmp/utils/identity';

interface LinkElement {
  _href: string;
  _rel?: string;
}

interface DfnCertAdvElement extends ModelElement {
  dfn_cert_adv?: {
    cve_refs?: number;
    raw_data?: {
      entry?: {
        author?: {
          name?: string;
          uri?: string;
        };
        cve?: string[];
        id?: string;
        link?: LinkElement | LinkElement[];
        published?: string;
        refnum?: string;
        summary?: {
          __text?: string;
          _type?: string;
        };
        title?: string;
        updated?: string;
      };
    };
    severity?: number;
    summary?: string;
    title?: string;
  };
  update_time?: string;
}

interface DfnCertAdvProperties extends ModelProperties {
  additionalLinks?: string[];
  advisoryLink?: string;
  cves?: string[];
  severity?: number;
  summary?: string;
  title?: string;
}

class DfnCertAdv extends Model {
  static entityType = 'dfncert';

  readonly additionalLinks: string[];
  readonly advisoryLink?: string;
  readonly cves: string[];
  readonly severity?: number;
  readonly summary?: string;
  readonly title?: string;

  constructor({
    additionalLinks = [],
    advisoryLink,
    cves = [],
    severity,
    summary,
    title,
    ...properties
  }: DfnCertAdvProperties = {}) {
    super(properties);

    this.additionalLinks = additionalLinks;
    this.advisoryLink = advisoryLink;
    this.cves = cves;
    this.severity = severity;
    this.summary = summary;
    this.title = title;
  }

  static fromElement(element?: DfnCertAdvElement): DfnCertAdv {
    return new DfnCertAdv(this.parseElement(element));
  }

  static parseElement(element: DfnCertAdvElement = {}): DfnCertAdvProperties {
    const dfnCertAdvElement = element.dfn_cert_adv;
    const ret = super.parseElement(element) as DfnCertAdvProperties;
    ret.severity = parseSeverity(dfnCertAdvElement?.severity);

    const {raw_data} = dfnCertAdvElement ?? {};

    const additionalLinks: string[] = [];
    let cves: string[] = [];

    if (isDefined(dfnCertAdvElement?.title)) {
      ret.title = dfnCertAdvElement.title;
    }

    if (isDefined(raw_data) && isDefined(raw_data.entry)) {
      const {entry} = raw_data;

      if (isDefined(entry.link)) {
        forEach(entry.link, link => {
          if (link._rel === 'alternate') {
            ret.advisoryLink = link._href;
          } else {
            additionalLinks.push(link._href);
          }
        });
      }

      if (isDefined(entry.summary)) {
        ret.summary = entry.summary.__text;
      }

      if (isDefined(entry.cve)) {
        cves = map(entry.cve, cve => cve);
      }
    }
    ret.additionalLinks = additionalLinks;
    ret.cves = cves;

    return ret;
  }
}

export default DfnCertAdv;

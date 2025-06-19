/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {Date} from 'gmp/models/date';
import Model, {ModelElement, ModelProperties} from 'gmp/models/model';
import {parseSeverity, parseDate, parseBoolean, YesNo} from 'gmp/parser';
import {map} from 'gmp/utils/array';
import {isDefined} from 'gmp/utils/identity';

interface CpeElement extends ModelElement {
  cpe?: {
    cpe_name_id?: string;
    cve_refs?: number;
    cves?: {
      cve: Array<{
        entry: {
          _id: string;
          cvss: {
            base_metrics: {
              score: number;
            };
          };
        };
      }>;
    };
    deprecated?: YesNo;
    deprecated_by?: {
      _cpe_id: string;
    };
    nvd_id?: string;
    raw_data?: {
      'cpe-item'?: {
        _deprecated_by?: string;
      };
    };
    references?: {
      reference: Array<{
        __text: string;
        _href: string;
      }>;
    };
    severity?: number;
    title?: string;
  };
  update_time?: string;
}

interface Cve {
  id: string;
  severity: number | undefined;
}

interface CpeProperties extends ModelProperties {
  cpeNameId?: string;
  cveRefs?: number;
  cves?: Cve[];
  deprecated?: boolean;
  deprecatedBy?: string;
  severity?: number;
  title?: string;
  updateTime?: Date;
}

class Cpe extends Model {
  static entityType = 'cpe';

  readonly cpeNameId?: string;
  readonly cveRefs: number;
  readonly cves: Cve[];
  readonly deprecated: boolean;
  readonly deprecatedBy?: string;
  readonly severity?: number;
  readonly title?: string;
  readonly updateTime?: Date;

  constructor({
    cpeNameId,
    cveRefs = 0,
    cves = [],
    deprecated = false,
    deprecatedBy,
    title,
    severity,
    updateTime,
    ...properties
  }: CpeProperties = {}) {
    super(properties);

    this.cpeNameId = cpeNameId;
    this.cveRefs = cveRefs;
    this.cves = cves;
    this.deprecated = deprecated;
    this.deprecatedBy = deprecatedBy;
    this.title = title;
    this.severity = severity;
    this.updateTime = updateTime;
  }

  static fromElement(element: CpeElement = {}): Cpe {
    return new Cpe(this.parseElement(element));
  }

  static parseElement(element: CpeElement): CpeProperties {
    const cpeElement = element.cpe;
    const ret = super.parseElement(element) as CpeProperties;

    ret.severity = parseSeverity(cpeElement?.severity);
    ret.cveRefs = isDefined(cpeElement?.cve_refs) ? cpeElement.cve_refs : 0;
    ret.title = cpeElement?.title;

    if (isDefined(cpeElement?.cves?.cve)) {
      ret.cves = map(cpeElement.cves.cve, cve => ({
        id: cve.entry._id,
        severity: parseSeverity(cve.entry.cvss.base_metrics.score),
      }));
    } else {
      ret.cves = [];
    }

    if (isDefined(cpeElement?.nvd_id)) {
      // old ID from nvd just kept for backwards compatibility and should be removed in future
      ret.cpeNameId = cpeElement.nvd_id;
    }

    if (isDefined(cpeElement?.cpe_name_id)) {
      ret.cpeNameId = cpeElement.cpe_name_id;
    }

    if (isDefined(element.update_time)) {
      ret.updateTime = parseDate(element.update_time);
    }

    /*
     * This code includes a backup check for deprecated field `raw_data`.
     * Once `raw_data` is removed from the API, this backup check can be removed.
     */

    if (isDefined(cpeElement?.deprecated)) {
      ret.deprecated = parseBoolean(cpeElement.deprecated);
    } else {
      ret.deprecated = false;
    }

    if (ret.deprecated === true && isDefined(cpeElement?.deprecated_by)) {
      ret.deprecatedBy = cpeElement.deprecated_by._cpe_id;
    } else if (isDefined(cpeElement?.raw_data?.['cpe-item']?._deprecated_by)) {
      ret.deprecatedBy = cpeElement.raw_data['cpe-item']._deprecated_by;
    }

    return ret;
  }
}

export default Cpe;

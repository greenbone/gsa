/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {z} from 'zod';
import {Date} from 'gmp/models/date';
import Model, {ModelElement, ModelProperties} from 'gmp/models/model';
import {parseSeverity, parseDate, parseBoolean, YesNo} from 'gmp/parser';
import {map} from 'gmp/utils/array';
import {isDefined} from 'gmp/utils/identity';
import {validateAndCreate} from 'gmp/utils/zodModelValidation';

type CpeProperties = z.infer<typeof CpePropertiesSchema> & ModelProperties;

type CpeElement = z.infer<typeof CpeElementSchema> & ModelElement;

const CveSchema = z.object({
  id: z.string(),
  severity: z.number().optional(),
});

export const CpePropertiesSchema = z.object({
  cpeNameId: z.string().optional(),
  cveRefs: z.number().optional(),
  cves: z.array(CveSchema).optional(),
  deprecated: z.boolean().optional(),
  deprecatedBy: z.string().optional(),
  severity: z.number().optional(),
  title: z.string().optional(),
  updateTime: z.custom<Date>().optional(),
});

export const CpeElementSchema = z.object({
  cpe: z
    .object({
      cpe_name_id: z.string().optional(),
      cve_refs: z.number().optional(),
      cves: z
        .object({
          cve: z.array(
            z.object({
              entry: z.object({
                _id: z.string(),
                cvss: z.object({
                  base_metrics: z.object({
                    score: z.number(),
                  }),
                }),
              }),
            }),
          ),
        })
        .optional(),
      deprecated: z.custom<YesNo>().optional(),
      deprecated_by: z
        .object({
          _cpe_id: z.string(),
        })
        .optional(),
      nvd_id: z.string().optional(),
      raw_data: z
        .object({
          'cpe-item': z
            .object({
              _deprecated_by: z.string().optional(),
            })
            .optional(),
        })
        .optional(),
      references: z
        .object({
          reference: z.array(
            z.object({
              __text: z.string(),
              _href: z.string(),
            }),
          ),
        })
        .optional(),
      severity: z.number().optional(),
      title: z.string().optional(),
    })
    .optional(),
  update_time: z.string().optional(),
});

const CpeSchema = z.object({
  cpeNameId: z.string().optional(),
  cveRefs: z.number().optional(),
  cves: z.array(CveSchema).optional(),
  deprecated: z.boolean().optional(),
  deprecatedBy: z.string().optional(),
  severity: z.number().optional(),
  title: z.string().optional(),
  updateTime: z.custom<Date>().optional(),
});

class Cpe extends Model {
  static readonly entityType = 'cpe';

  readonly cpeNameId?: string;
  readonly cveRefs: number;
  readonly cves: z.infer<typeof CveSchema>[];
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
    const parsedElement = this.parseElement(element);

    return validateAndCreate({
      schema: CpeSchema,
      parsedElement,
      originalElement: element,
      modelName: 'cpe',
      ModelClass: Cpe,
    });
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

/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {z} from 'zod';
import {Date} from 'gmp/models/date';
import Model, {ModelElement, ModelProperties} from 'gmp/models/model';
import {parseDate, parseSeverity, parseToString} from 'gmp/parser';
import {
  parseCvssV2BaseFromVector,
  parseCvssV3BaseFromVector,
} from 'gmp/parser/cvss';
import {parseCvssV4MetricsFromVector} from 'gmp/parser/cvssV4';
import {map} from 'gmp/utils/array';
import {isArray, isDefined} from 'gmp/utils/identity';
import {isEmpty} from 'gmp/utils/string';
import {validateAndCreate} from 'gmp/utils/zodModelValidation';

type CveProperties = z.infer<typeof CvePropertiesSchema> & ModelProperties;

type CveElement = z.infer<typeof CveElementSchema> & ModelElement;

const CertRefElementSchema = z.object({
  name: z.string(),
  title: z.string(),
  _type: z.string(),
});

const NvtElementSchema = z.object({
  _oid: z.string(),
  name: z.string(),
});

const RawReferenceElementSchema = z.object({
  reference: z
    .object({
      __text: z.string(),
      _href: z.string(),
    })
    .optional(),
  source: z.string().optional(),
  _reference_type: z.string().optional(),
});

const ReferenceElementSchema = z.object({
  url: z.string(),
  tags: z
    .object({
      tag: z.union([z.string(), z.array(z.string())]).optional(),
    })
    .optional(),
});

const NvtSchema = z.object({
  id: z.string(),
  oid: z.string(),
  name: z.string(),
});

const CertSchema = z.object({
  name: z.string(),
  title: z.string(),
  cert_type: z.string(),
});

const ReferenceSchema = z.object({
  name: z.string().optional(),
  tags: z.array(z.string()).optional(),
  href: z.string().optional(),
  source: z.string().optional(),
  reference_type: z.string().optional(),
});

const EpssSchema = z.object({
  percentile: z.number().optional(),
  score: z.number().optional(),
});

export const CvePropertiesSchema = z.object({
  certs: z.array(CertSchema).optional(),
  cvssAccessComplexity: z.string().optional(),
  cvssAccessVector: z.string().optional(),
  cvssAttackComplexity: z.string().optional(),
  cvssAttackRequirements: z.string().optional(),
  cvssAttackVector: z.string().optional(),
  cvssAuthentication: z.string().optional(),
  cvssAvailabilityImpact: z.string().optional(),
  cvssAvailabilitySS: z.string().optional(),
  cvssAvailabilityVS: z.string().optional(),
  cvssBaseVector: z.string().optional(),
  cvssConfidentialityImpact: z.string().optional(),
  cvssConfidentialitySS: z.string().optional(),
  cvssConfidentialityVS: z.string().optional(),
  cvssIntegrityImpact: z.string().optional(),
  cvssIntegritySS: z.string().optional(),
  cvssIntegrityVS: z.string().optional(),
  cvssPrivilegesRequired: z.string().optional(),
  cvssScope: z.string().optional(),
  cvssUserInteraction: z.string().optional(),
  description: z.string().optional(),
  epss: EpssSchema.optional(),
  lastModifiedTime: z.custom<Date>().optional(),
  nvts: z.array(NvtSchema).optional(),
  products: z.array(z.string()).optional(),
  publishedTime: z.custom<Date>().optional(),
  references: z.array(ReferenceSchema).optional(),
  severity: z.number().optional(),
  updateTime: z.custom<Date>().optional(),
});

export const CveElementSchema = z.object({
  cve: z
    .object({
      cert: z
        .object({
          cert_ref: z
            .union([CertRefElementSchema, z.array(CertRefElementSchema)])
            .optional(),
        })
        .optional(),
      configuration_nodes: z
        .object({
          node: z
            .array(
              z.object({
                match_string: z
                  .object({
                    vulnerable: z.number().optional(),
                    criteria: z.string().optional(),
                    matched_cpes: z
                      .object({
                        cpe: z
                          .array(
                            z.object({
                              _id: z.string(),
                              deprecated: z.number().optional(),
                            }),
                          )
                          .optional(),
                      })
                      .optional(),
                    status: z.string().optional(),
                    version_end_excluding: z.string().optional(),
                    version_end_including: z.string().optional(),
                    version_start_excluding: z.string().optional(),
                    version_start_including: z.string().optional(),
                  })
                  .optional(),
                negate: z.number().optional(),
                operator: z.string().optional(),
              }),
            )
            .optional(),
        })
        .optional(),
      cvss_vector: z.string().optional(),
      description: z.string().optional(),
      epss: z
        .object({
          percentile: z.number().optional(),
          score: z.number().optional(),
        })
        .optional(),
      nvts: z
        .object({
          nvt: z
            .union([NvtElementSchema, z.array(NvtElementSchema)])
            .optional(),
        })
        .optional(),
      products: z.string().optional(),
      raw_data: z
        .object({
          entry: z
            .object({
              _id: z.string().optional(),
              'cve-id': z.string().optional(),
              cvss: z
                .object({
                  base_metrics: z
                    .object({
                      'access-complexity': z.string(),
                      'access-vector': z.string(),
                      authentication: z.string(),
                      'availability-impact': z.string(),
                      'confidentiality-impact': z.string(),
                      'integrity-impact': z.string(),
                      score: z.number(),
                      source: z.string(),
                      'vector-string': z.string(),
                    })
                    .optional(),
                  'generated-on-datetime': z.string().optional(),
                })
                .optional(),
              cvss3: z
                .object({
                  base_metrics: z
                    .object({
                      'attack-complexity': z.string(),
                      'attack-vector': z.string(),
                      'availability-impact': z.string(),
                      'base-score': z.number(),
                      'base-severity': z.string(),
                      'confidentiality-impact': z.string(),
                      'integrity-impact': z.string(),
                      'privileges-required': z.string(),
                      scope: z.string(),
                      'user-interaction': z.string(),
                      'vector-string': z.string(),
                    })
                    .optional(),
                })
                .optional(),
              'published-datetime': z.string().optional(),
              'last-modified-datetime': z.string().optional(),
              'vulnerable-software-list': z
                .object({
                  product: z
                    .union([z.string(), z.array(z.string())])
                    .optional(),
                })
                .optional(),
              references: z
                .union([
                  RawReferenceElementSchema,
                  z.array(RawReferenceElementSchema),
                ])
                .optional(),
            })
            .optional(),
        })
        .optional(),
      references: z
        .object({
          reference: z
            .union([ReferenceElementSchema, z.array(ReferenceElementSchema)])
            .optional(),
        })
        .optional(),
      severity: z.number().optional(),
    })
    .optional(),
  update_time: z.string().optional(),
});

const CveSchema = z.object({
  certs: z.array(CertSchema).optional(),
  cvssAccessComplexity: z.string().optional(),
  cvssAccessVector: z.string().optional(),
  cvssAttackComplexity: z.string().optional(),
  cvssAttackRequirements: z.string().optional(),
  cvssAttackVector: z.string().optional(),
  cvssAuthentication: z.string().optional(),
  cvssAvailabilityImpact: z.string().optional(),
  cvssAvailabilitySS: z.string().optional(),
  cvssAvailabilityVS: z.string().optional(),
  cvssBaseVector: z.string().optional(),
  cvssConfidentialityImpact: z.string().optional(),
  cvssConfidentialitySS: z.string().optional(),
  cvssConfidentialityVS: z.string().optional(),
  cvssIntegrityImpact: z.string().optional(),
  cvssIntegritySS: z.string().optional(),
  cvssIntegrityVS: z.string().optional(),
  cvssPrivilegesRequired: z.string().optional(),
  cvssScope: z.string().optional(),
  cvssUserInteraction: z.string().optional(),
  description: z.string().optional(),
  epss: EpssSchema.optional(),
  lastModifiedTime: z.custom<Date>().optional(),
  nvts: z.array(NvtSchema).optional(),
  products: z.array(z.string()).optional(),
  publishedTime: z.custom<Date>().optional(),
  references: z.array(ReferenceSchema).optional(),
  severity: z.number().optional(),
  updateTime: z.custom<Date>().optional(),
});

class Cve extends Model {
  static readonly entityType = 'cve';

  readonly certs: z.infer<typeof CertSchema>[];
  readonly cvssAccessComplexity?: string;
  readonly cvssAccessVector?: string;
  readonly cvssAttackComplexity?: string;
  readonly cvssAttackRequirements?: string;
  readonly cvssAttackVector?: string;
  readonly cvssAuthentication?: string;
  readonly cvssAvailabilityImpact?: string;
  readonly cvssAvailabilitySS?: string;
  readonly cvssAvailabilityVS?: string;
  readonly cvssBaseVector?: string;
  readonly cvssConfidentialityImpact?: string;
  readonly cvssConfidentialitySS?: string;
  readonly cvssConfidentialityVS?: string;
  readonly cvssIntegrityImpact?: string;
  readonly cvssIntegritySS?: string;
  readonly cvssIntegrityVS?: string;
  readonly cvssPrivilegesRequired?: string;
  readonly cvssScope?: string;
  readonly cvssUserInteraction?: string;
  readonly description?: string;
  readonly epss?: z.infer<typeof EpssSchema>;
  readonly lastModifiedTime?: Date;
  readonly nvts: z.infer<typeof NvtSchema>[];
  readonly products: string[];
  readonly publishedTime?: Date;
  readonly references: z.infer<typeof ReferenceSchema>[];
  readonly severity?: number;
  readonly updateTime?: Date;

  constructor({
    certs = [],
    cvssAccessComplexity,
    cvssAccessVector,
    cvssAttackComplexity,
    cvssAttackRequirements,
    cvssAttackVector,
    cvssAuthentication,
    cvssAvailabilityImpact,
    cvssAvailabilitySS,
    cvssAvailabilityVS,
    cvssBaseVector,
    cvssConfidentialityImpact,
    cvssConfidentialitySS,
    cvssConfidentialityVS,
    cvssIntegrityImpact,
    cvssIntegritySS,
    cvssIntegrityVS,
    cvssPrivilegesRequired,
    cvssScope,
    cvssUserInteraction,
    description,
    epss,
    lastModifiedTime,
    nvts = [],
    products = [],
    publishedTime,
    references = [],
    severity,
    updateTime,
    ...properties
  }: CveProperties = {}) {
    super(properties);

    this.certs = certs;
    this.cvssAccessComplexity = cvssAccessComplexity;
    this.cvssAccessVector = cvssAccessVector;
    this.cvssAttackComplexity = cvssAttackComplexity;
    this.cvssAttackRequirements = cvssAttackRequirements;
    this.cvssAttackVector = cvssAttackVector;
    this.cvssAuthentication = cvssAuthentication;
    this.cvssAvailabilityImpact = cvssAvailabilityImpact;
    this.cvssAvailabilitySS = cvssAvailabilitySS;
    this.cvssAvailabilityVS = cvssAvailabilityVS;
    this.cvssBaseVector = cvssBaseVector;
    this.cvssConfidentialityImpact = cvssConfidentialityImpact;
    this.cvssConfidentialitySS = cvssConfidentialitySS;
    this.cvssConfidentialityVS = cvssConfidentialityVS;
    this.cvssIntegrityImpact = cvssIntegrityImpact;
    this.cvssIntegritySS = cvssIntegritySS;
    this.cvssIntegrityVS = cvssIntegrityVS;
    this.cvssPrivilegesRequired = cvssPrivilegesRequired;
    this.cvssScope = cvssScope;
    this.cvssUserInteraction = cvssUserInteraction;
    this.description = description;
    this.epss = epss;
    this.lastModifiedTime = lastModifiedTime;
    this.nvts = nvts;
    this.products = products;
    this.publishedTime = publishedTime;
    this.references = references;
    this.severity = severity;
    this.updateTime = updateTime;
  }

  static fromElement(element: CveElement = {}): Cve {
    const parsedElement = this.parseElement(element);

    return validateAndCreate({
      schema: CveSchema,
      parsedElement,
      originalElement: element,
      modelName: 'cve',
      ModelClass: Cve,
    });
  }

  static parseElement(element: CveElement = {}): CveProperties {
    const cveElement = element.cve;
    const ret = super.parseElement(element) as CveProperties;

    if (isDefined(element.update_time)) {
      ret.updateTime = parseDate(element.update_time);
    }
    ret.severity = parseSeverity(cveElement?.severity);
    ret.description = parseToString(cveElement?.description);

    if (isDefined(cveElement?.nvts)) {
      ret.nvts = map(cveElement?.nvts.nvt, nvt => {
        return {
          id: nvt._oid,
          oid: nvt._oid,
          name: nvt.name,
        };
      });
    }

    if (isDefined(cveElement?.cert)) {
      ret.certs = map(cveElement.cert.cert_ref, ref => {
        return {
          name: ref.name,
          title: ref.title,
          cert_type: ref._type,
        };
      });
    } else {
      ret.certs = [];
    }

    const cvssVector = cveElement?.cvss_vector ?? '';
    if (cvssVector.includes('CVSS:4')) {
      const {AV, AC, AT, PR, UI, VC, VI, VA, SC, SI, SA} =
        parseCvssV4MetricsFromVector(cvssVector);
      ret.cvssAttackVector = AV;
      ret.cvssAttackComplexity = AC;
      ret.cvssAttackRequirements = AT;
      ret.cvssPrivilegesRequired = PR;
      ret.cvssUserInteraction = UI;
      ret.cvssConfidentialityVS = VC;
      ret.cvssIntegrityVS = VI;
      ret.cvssAvailabilityVS = VA;
      ret.cvssConfidentialitySS = SC;
      ret.cvssIntegritySS = SI;
      ret.cvssAvailabilitySS = SA;
    } else if (cvssVector.includes('CVSS:3')) {
      const {
        attackVector,
        attackComplexity,
        privilegesRequired,
        userInteraction,
        scope,
        confidentialityImpact,
        integrityImpact,
        availabilityImpact,
      } = parseCvssV3BaseFromVector(cvssVector);
      ret.cvssAttackVector = attackVector;
      ret.cvssAttackComplexity = attackComplexity;
      ret.cvssPrivilegesRequired = privilegesRequired;
      ret.cvssUserInteraction = userInteraction;
      ret.cvssScope = scope;
      ret.cvssConfidentialityImpact = confidentialityImpact;
      ret.cvssIntegrityImpact = integrityImpact;
      ret.cvssAvailabilityImpact = availabilityImpact;
    } else {
      const {
        accessVector,
        accessComplexity,
        authentication,
        confidentialityImpact,
        integrityImpact,
        availabilityImpact,
      } = parseCvssV2BaseFromVector(cvssVector);
      ret.cvssAccessVector = accessVector;
      ret.cvssAccessComplexity = accessComplexity;
      ret.cvssAuthentication = authentication;
      ret.cvssConfidentialityImpact = confidentialityImpact;
      ret.cvssIntegrityImpact = integrityImpact;
      ret.cvssAvailabilityImpact = availabilityImpact;
    }

    ret.cvssBaseVector = isEmpty(cvssVector) ? undefined : cvssVector;

    let products = (
      isEmpty(cveElement?.products)
        ? []
        : // @ts-expect-error
          cveElement.products.split(' ')
    ) as string[];

    /*
     * The following code blocks for published-datetime, last-modified-datetime, products, and references
     * include a backup check for deprecated field `raw_data`.
     * Once `raw_data` is removed from the API, this check can be removed.
     */

    ret.publishedTime = parseDate(
      ret.creationTime ?? cveElement?.raw_data?.entry?.['published-datetime'],
    );
    ret.lastModifiedTime = parseDate(
      ret.modificationTime ??
        cveElement?.raw_data?.entry?.['last-modified-datetime'],
    );

    ret.references = [];
    if (isDefined(cveElement?.references?.reference)) {
      ret.references = map(cveElement.references.reference, ref => {
        const tags = map(ref.tags?.tag, tag => tag);
        return {
          name: ref.url,
          tags: tags,
          href: ref.url,
        };
      });
    } else {
      const {entry} = cveElement?.raw_data ?? {};
      const referencesList = entry?.references || [];
      ret.references = map(referencesList, ref => ({
        name: ref.reference?.__text,
        href: ref.reference?._href,
        source: ref.source,
        reference_type: ref._reference_type,
      }));
    }

    if (
      products &&
      products.length === 0 &&
      isDefined(cveElement?.configuration_nodes?.node)
    ) {
      const nodes = isArray(cveElement?.configuration_nodes.node)
        ? cveElement.configuration_nodes.node
        : [cveElement.configuration_nodes.node];
      nodes.forEach(node => {
        if (
          node.match_string?.vulnerable === 1 &&
          isDefined(node.match_string?.matched_cpes?.cpe)
        ) {
          const cpes = isArray(node.match_string.matched_cpes.cpe)
            ? node.match_string.matched_cpes.cpe
            : [node.match_string.matched_cpes.cpe];
          cpes.forEach(cpe => {
            if (isDefined(cpe._id)) {
              products.push(cpe._id);
            }
          });
        }
      });
    } else {
      const productsEntry =
        cveElement?.raw_data?.entry?.['vulnerable-software-list']?.product;
      if (productsEntry) {
        products = isArray(productsEntry) ? productsEntry : [productsEntry];
      }
    }

    ret.products = isArray(products)
      ? products.filter(product => product !== '')
      : [];

    if (isDefined(cveElement?.epss)) {
      ret.epss = cveElement.epss;
    }

    return ret;
  }
}

export default Cve;

/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

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

interface CertRefElement {
  name: string;
  title: string;
  _type: string;
}

interface NvtElement {
  _oid: string;
  name: string;
}

interface RawReferenceElement {
  reference?: {
    __text: string;
    _href: string;
  };
  source?: string;
  _reference_type?: string;
}

interface ReferenceElement {
  url: string;
  tags?: {
    tag?: string | string[];
  };
}

interface CveElement extends ModelElement {
  cve?: {
    cert?: {
      cert_ref?: CertRefElement | CertRefElement[];
    };
    configuration_nodes?: {
      node?: Array<{
        match_string?: {
          vulnerable?: number;
          criteria?: string;
          matched_cpes?: {
            cpe?: Array<{
              _id: string;
              deprecated?: number;
            }>;
          };
          status?: string;
          version_end_excluding?: string;
          version_end_including?: string;
          version_start_excluding?: string;
          version_start_including?: string;
        };
        negate?: number;
        operator?: string;
      }>;
    };
    cvss_vector?: string;
    description?: string;
    epss?: {
      percentile?: number;
      score?: number;
    };
    nvts?: {
      nvt?: NvtElement | NvtElement[];
    };
    products?: string;
    raw_data?: {
      entry?: {
        _id?: string;
        'cve-id'?: string;
        cvss?: {
          base_metrics?: {
            'access-complexity': string;
            'access-vector': string;
            authentication: string;
            'availability-impact': string;
            'confidentiality-impact': string;
            'integrity-impact': string;
            score: number;
            source: string;
            'vector-string': string;
          };
          'generated-on-datetime'?: string;
        };
        cvss3?: {
          base_metrics?: {
            'attack-complexity': string;
            'attack-vector': string;
            'availability-impact': string;
            'base-score': number;
            'base-severity': string;
            'confidentiality-impact': string;
            'integrity-impact': string;
            'privileges-required': string;
            scope: string;
            'user-interaction': string;
            'vector-string': string;
          };
        };
        'published-datetime'?: string;
        'last-modified-datetime'?: string;
        'vulnerable-software-list'?: {
          product?: string | Array<string>;
        };
        references?: RawReferenceElement | RawReferenceElement[];
      };
    };
    references?: {
      reference?: ReferenceElement | ReferenceElement[];
    };
    severity?: number;
  };
  update_time?: string;
}

interface Nvt {
  id: string;
  oid: string;
  name: string;
}

interface Cert {
  name: string;
  title: string;
  cert_type: string;
}

interface Reference {
  name?: string;
  tags?: string[];
  href?: string;
  source?: string;
  reference_type?: string;
}

interface Epss {
  percentile?: number;
  score?: number;
}

interface CveProperties extends ModelProperties {
  certs?: Cert[];
  cvssAccessComplexity?: string;
  cvssAccessVector?: string;
  cvssAttackComplexity?: string;
  cvssAttackRequirements?: string;
  cvssAttackVector?: string;
  cvssAuthentication?: string;
  cvssAvailabilityImpact?: string;
  cvssAvailabilitySS?: string;
  cvssAvailabilityVS?: string;
  cvssBaseVector?: string;
  cvssConfidentialityImpact?: string;
  cvssConfidentialitySS?: string;
  cvssConfidentialityVS?: string;
  cvssIntegrityImpact?: string;
  cvssIntegritySS?: string;
  cvssIntegrityVS?: string;
  cvssPrivilegesRequired?: string;
  cvssScope?: string;
  cvssUserInteraction?: string;
  description?: string;
  epss?: Epss;
  lastModifiedTime?: Date;
  nvts?: Nvt[];
  products?: string[];
  publishedTime?: Date;
  references?: Reference[];
  severity?: number;
  updateTime?: Date;
}

class Cve extends Model {
  static entityType = 'cve';

  readonly certs: Cert[];
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
  readonly epss?: Epss;
  readonly lastModifiedTime?: Date;
  readonly nvts: Nvt[];
  readonly products: string[];
  readonly publishedTime?: Date;
  readonly references: Reference[];
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
    return new Cve(this.parseElement(element));
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

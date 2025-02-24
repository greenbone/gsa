/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Info from 'gmp/models/info';
import {parseDate, parseSeverity, setProperties} from 'gmp/parser';
import {
  parseCvssV2BaseFromVector,
  parseCvssV3BaseFromVector,
} from 'gmp/parser/cvss';
import {parseCvssV4MetricsFromVector} from 'gmp/parser/cvssV4';
import {map} from 'gmp/utils/array';
import {isArray, isDefined} from 'gmp/utils/identity';
import {isEmpty} from 'gmp/utils/string';


class Cve extends Info {
  static entityType = 'cve';

  static fromResultElement(element) {
    const ret = {};

    ret.name = element.name;
    ret.id = element.name;
    ret.epss = element.epss;

    return ret;
  }

  static parseElement(element) {
    const ret = super.parseElement(element, 'cve');

    if (isDefined(ret.update_time)) {
      ret.updateTime = parseDate(ret.update_time);
      delete ret.update_time;
    }
    ret.severity = parseSeverity(ret.severity);

    if (isDefined(ret.nvts)) {
      ret.nvts = map(ret.nvts.nvt, nvt => {
        return setProperties({
          ...nvt,
          id: nvt._oid,
          oid: nvt._oid,
        });
      });
    }

    if (isDefined(ret.cert)) {
      ret.certs = map(ret.cert.cert_ref, ref => {
        return {
          name: ref.name,
          title: ref.title,
          cert_type: ref._type,
        };
      });

      delete ret.cert;
    } else {
      ret.certs = [];
    }
    if (isEmpty(ret.cvss_vector)) {
      ret.cvss_vector = '';
    }
    if (ret.cvss_vector.includes('CVSS:4')) {
      const {AV, AC, AT, PR, UI, VC, VI, VA, SC, SI, SA} =
        parseCvssV4MetricsFromVector(ret.cvss_vector);
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
    } else if (ret.cvss_vector.includes('CVSS:3')) {
      const {
        attackVector,
        attackComplexity,
        privilegesRequired,
        userInteraction,
        scope,
        confidentialityImpact,
        integrityImpact,
        availabilityImpact,
      } = parseCvssV3BaseFromVector(ret.cvss_vector);
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
      } = parseCvssV2BaseFromVector(ret.cvss_vector);
      ret.cvssAccessVector = accessVector;
      ret.cvssAccessComplexity = accessComplexity;
      ret.cvssAuthentication = authentication;
      ret.cvssConfidentialityImpact = confidentialityImpact;
      ret.cvssIntegrityImpact = integrityImpact;
      ret.cvssAvailabilityImpact = availabilityImpact;
    }

    ret.cvssBaseVector = ret.cvss_vector;

    ret.products = isEmpty(ret.products) ? [] : ret.products.split(' ');

    /*
     * The following code blocks for published-datetime, last-modified-datetime, products, and references
     * include a backup check for deprecated field `raw_data`.
     * Once `raw_data` is removed from the API, this check can be removed.
     */

    ret.publishedTime = parseDate(
      ret['creationTime'] ?? ret.raw_data?.entry?.['published-datetime'],
    );
    ret.lastModifiedTime = parseDate(
      ret['modificationTime'] ??
        ret.raw_data?.entry?.['last-modified-datetime'],
    );

    ret.references = [];
    if (element.cve && isDefined(element.cve.references?.reference)) {
      ret.references = map(element.cve.references.reference, ref => {
        let tags = [];
        if (isArray(ref.tags.tag)) {
          tags = ref.tags.tag;
        } else if (isDefined(ref.tags.tag)) {
          tags = [ref.tags.tag];
        }
        return {
          name: ref.url,
          tags: tags,
          href: ref.url,
        };
      });
    } else {
      const {entry} = ret.raw_data ?? {};
      const referencesList = entry?.references || [];
      ret.references = map(referencesList, ref => ({
        name: ref.reference?.__text,
        href: ref.reference?._href,
        source: ref.source,
        reference_type: ref._reference_type,
      }));
    }

    if (
      ret.products &&
      ret.products.length === 0 &&
      isDefined(element.cve?.configuration_nodes?.node)
    ) {
      const nodes = isArray(element.cve.configuration_nodes.node)
        ? element.cve.configuration_nodes.node
        : [element.cve.configuration_nodes.node];
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
              ret.products.push(cpe._id);
            }
          });
        }
      });
    } else {
      const productsEntry =
        ret.raw_data?.entry?.['vulnerable-software-list']?.product;
      if (productsEntry) {
        ret.products = isArray(productsEntry) ? productsEntry : [productsEntry];
      }
    }

    ret.products = ret.products.filter(product => product !== '');

    return ret;
  }
}

export default Cve;

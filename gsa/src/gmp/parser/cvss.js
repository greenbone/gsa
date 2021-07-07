/* Copyright (C) 2017-2021 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

import {isDefined} from 'gmp/utils/identity';

/* CVSS v2 .... */

/**
 * (from https://nvd.nist.gov/site-media/js/nvdApp/cvssV2/cvssV2.service.js)
 * Handles percision and rounding of numbers to one decimal place
 * @param value
 * @returns {number}
 */
const toFixed1 = value => {
  if (isNaN(value)) {
    return undefined;
  }
  const result = +(`${Math.round(+(`${value}e` + 1))}e` + -1);
  // if no fractional part then add a .0 to the number
  return result;
};

/*
 * Calculating the CVSS v2 BaseScore
 */
const baseScore = ({av, ac, au, c, i, a}) => {
  const raw_impact = 10.41 * (1.0 - (1.0 - c) * (1.0 - i) * (1.0 - a));
  const raw_exploit = 20 * ac * av * au;
  const f_impact = raw_impact === 0.0 ? 0.0 : 1.176;
  return toFixed1((0.6 * raw_impact + 0.4 * raw_exploit - 1.5) * f_impact);
};

/*
 * Parsing the CVSS v2 Metric Values to a valid Vector and BaseScore
 */
export const parseCvssV2BaseVector = ({
  accessVector,
  accessComplexity,
  authentication,
  confidentialityImpact,
  availabilityImpact,
  integrityImpact,
} = {}) => {
  if (
    !isDefined(accessVector) &&
    !isDefined(accessComplexity) &&
    !isDefined(authentication) &&
    !isDefined(confidentialityImpact) &&
    !isDefined(integrityImpact) &&
    !isDefined(availabilityImpact)
  ) {
    return [undefined, undefined];
  }

  let av;
  let ac;
  let au;
  let c;
  let i;
  let a;
  let vector = 'AV:';

  switch (accessVector) {
    case 'LOCAL':
      vector += 'L';
      av = 0.395;
      break;
    case 'ADJACENT_NETWORK':
      vector += 'A';
      av = 0.646;
      break;
    case 'NETWORK':
      vector += 'N';
      av = 1.0;
      break;
    default:
      vector += 'ERROR';
      av = undefined;
  }

  vector += '/AC:';
  switch (accessComplexity) {
    case 'LOW':
      vector += 'L';
      ac = 0.71;
      break;
    case 'MEDIUM':
      vector += 'M';
      ac = 0.61;
      break;
    case 'HIGH':
      vector += 'H';
      ac = 0.35;
      break;
    default:
      vector += 'ERROR';
      ac = undefined;
  }

  vector += '/Au:';
  switch (authentication) {
    case 'NONE':
      vector += 'N';
      au = 0.704;
      break;
    case 'MULTIPLE_INSTANCES':
      vector += 'M';
      au = 0.45;
      break;
    case 'SINGLE_INSTANCE':
      vector += 'S';
      au = 0.56;
      break;
    default:
      vector += 'ERROR';
      au = undefined;
  }

  vector += '/C:';
  switch (confidentialityImpact) {
    case 'NONE':
      vector += 'N';
      c = 0.0;
      break;
    case 'PARTIAL':
      vector += 'P';
      c = 0.275;
      break;
    case 'COMPLETE':
      vector += 'C';
      c = 0.66;
      break;
    default:
      vector += 'ERROR';
      c = undefined;
  }

  vector += '/I:';
  switch (integrityImpact) {
    case 'NONE':
      vector += 'N';
      i = 0.0;
      break;
    case 'PARTIAL':
      vector += 'P';
      i = 0.275;
      break;
    case 'COMPLETE':
      vector += 'C';
      i = 0.66;
      break;
    default:
      vector += 'ERROR';
      i = undefined;
  }

  vector += '/A:';
  switch (availabilityImpact) {
    case 'NONE':
      vector += 'N';
      a = 0.0;
      break;
    case 'PARTIAL':
      vector += 'P';
      a = 0.275;
      break;
    case 'COMPLETE':
      vector += 'C';
      a = 0.66;
      break;
    default:
      vector += 'ERROR';
      a = undefined;
  }

  const base = baseScore({av, ac, au, c, i, a});

  return [vector, base];
};

/*
 * Parsing the CVSS v2 Vector to valid Metric Values and BaseScore
 * @param vector    a valid CVSS v2 vector:
 *                  AV:L/AC:L/Au:N/C:N/I:N/A:N
 * @return {}       if the vector is valid:
 *                  the different metric values and the calculated
 *                  v2 base score
 */
export const parseCvssV2BaseFromVector = vector => {
  if (!isDefined(vector) || vector.trim().length === 0) {
    return {};
  }

  let av;
  let accessVector;
  let ac;
  let accessComplexity;
  let au;
  let authentication;
  let c;
  let confidentialityImpact;
  let i;
  let integrityImpact;
  let a;
  let availabilityImpact;

  const values = vector.split('/');

  for (const currentvalue of values) {
    let [metric, value] = currentvalue.split(':');

    metric = metric.toLowerCase();
    value = isDefined(value) ? value.toLowerCase() : '';

    switch (metric) {
      case 'av':
        if (value === 'l') {
          accessVector = 'LOCAL';
          av = 0.395;
        } else if (value === 'a') {
          accessVector = 'ADJACENT_NETWORK';
          av = 0.646;
        } else if (value === 'n') {
          accessVector = 'NETWORK';
          av = 1.0;
        }
        break;
      case 'ac':
        if (value === 'h') {
          accessComplexity = 'HIGH';
          ac = 0.35;
        } else if (value === 'm') {
          accessComplexity = 'MEDIUM';
          ac = 0.61;
        } else if (value === 'l') {
          accessComplexity = 'LOW';
          ac = 0.71;
        }
        break;
      case 'au':
        if (value === 'm') {
          authentication = 'MULTIPLE_INSTANCES';
          au = 0.45;
        } else if (value === 's') {
          authentication = 'SINGLE_INSTANCE';
          au = 0.56;
        } else if (value === 'n') {
          authentication = 'NONE';
          au = 0.704;
        }
        break;
      case 'c':
        if (value === 'c') {
          confidentialityImpact = 'COMPLETE';
          c = 0.66;
        } else if (value === 'p') {
          confidentialityImpact = 'PARTIAL';
          c = 0.275;
        } else if (value === 'n') {
          confidentialityImpact = 'NONE';
          c = 0.0;
        }
        break;
      case 'i':
        if (value === 'c') {
          integrityImpact = 'COMPLETE';
          i = 0.66;
        } else if (value === 'p') {
          integrityImpact = 'PARTIAL';
          i = 0.275;
        } else if (value === 'n') {
          integrityImpact = 'NONE';
          i = 0.0;
        }
        break;
      case 'a':
        if (value === 'c') {
          availabilityImpact = 'COMPLETE';
          a = 0.66;
        } else if (value === 'p') {
          availabilityImpact = 'PARTIAL';
          a = 0.275;
        } else if (value === 'n') {
          availabilityImpact = 'NONE';
          a = 0.0;
        }
        break;
      default:
        break;
    }
  }

  const base = baseScore({av, ac, au, c, i, a});

  return {
    accessVector: accessVector,
    accessComplexity: accessComplexity,
    authentication: authentication,
    confidentialityImpact: confidentialityImpact,
    integrityImpact: integrityImpact,
    availabilityImpact: availabilityImpact,
    cvssScore: base,
  };
};

/* CVSSv3.1 .... */

/*
 * Parsing the CVSS v3 Metric Values to a valid Vector and BaseScore
 * @param attackVector              AV Metric Value
 * @param attackComplexity          AC Metric Value
 * @param privilegesRequired        PR Metric Value
 * @param userInteraction           UI Metric Value
 * @param scope                     S Metric Value
 * @param confidentialityImpact     C Metric Value
 * @param integrityImpact           I Metric Value
 * @param availabilityImpact        A Metric Value
 */
export const parseCvssV3BaseVector = ({
  attackVector,
  attackComplexity,
  privilegesRequired,
  userInteraction,
  scope,
  confidentialityImpact,
  integrityImpact,
  availabilityImpact,
} = {}) => {
  if (
    !isDefined(attackVector) &&
    !isDefined(attackComplexity) &&
    !isDefined(privilegesRequired) &&
    !isDefined(userInteraction) &&
    !isDefined(scope) &&
    !isDefined(confidentialityImpact) &&
    !isDefined(integrityImpact) &&
    !isDefined(availabilityImpact)
  ) {
    return [undefined, undefined];
  }

  let av;
  let ac;
  let pr;
  let ui;
  let s;
  let c;
  let i;
  let a;

  let vector = 'CVSS:3.1/AV:';

  switch (attackVector) {
    case 'PHYSICAL':
      vector += 'P';
      av = 0.2;
      break;
    case 'LOCAL':
      vector += 'L';
      av = 0.55;
      break;
    case 'ADJACENT_NETWORK':
      vector += 'A';
      av = 0.62;
      break;
    case 'NETWORK':
      vector += 'N';
      av = 0.85;
      break;
    default:
      vector += 'ERROR';
      ac = undefined;
  }

  vector += '/AC:';
  switch (attackComplexity) {
    case 'HIGH':
      vector += 'H';
      ac = 0.44;
      break;
    case 'LOW':
      vector += 'L';
      ac = 0.77;
      break;
    default:
      vector += 'ERROR';
      ac = undefined;
  }

  vector += '/PR:';
  switch (privilegesRequired) {
    case 'HIGH':
      vector += 'H';
      pr = 0.27;
      break;
    case 'LOW':
      vector += 'L';
      pr = 0.62;
      break;
    case 'NONE':
      vector += 'N';
      pr = 0.85;
      break;
    default:
      vector += 'ERROR';
      pr = undefined;
  }

  vector += '/UI:';
  switch (userInteraction) {
    case 'REQUIRED':
      vector += 'R';
      ui = 0.62;
      break;
    case 'NONE':
      vector += 'N';
      ui = 0.85;
      break;
    default:
      vector += 'ERROR';
      ui = undefined;
  }

  vector += '/S:';
  switch (scope) {
    case 'UNCHANGED':
      vector += 'U';
      s = 6.42;
      break;
    case 'CHANGED':
      vector += 'C';
      s = 7.52;
      break;
    default:
      vector += 'ERROR';
      s = undefined;
  }

  vector += '/C:';
  switch (confidentialityImpact) {
    case 'HIGH':
      vector += 'H';
      c = 0.56;
      break;
    case 'LOW':
      vector += 'L';
      c = 0.22;
      break;
    case 'NONE':
      vector += 'N';
      c = 0.0;
      break;
    default:
      vector += 'ERROR';
      c = undefined;
  }

  vector += '/I:';
  switch (integrityImpact) {
    case 'HIGH':
      vector += 'H';
      i = 0.56;
      break;
    case 'LOW':
      vector += 'L';
      i = 0.22;
      break;
    case 'NONE':
      vector += 'N';
      i = 0.0;
      break;
    default:
      vector += 'ERROR';
      i = undefined;
  }

  vector += '/A:';
  switch (availabilityImpact) {
    case 'HIGH':
      vector += 'H';
      a = 0.56;
      break;
    case 'LOW':
      vector += 'L';
      a = 0.22;
      break;
    case 'NONE':
      vector += 'N';
      a = 0.0;
      break;
    default:
      vector += 'ERROR';
      a = undefined;
  }
  let base = V3ScoreBase({av, ac, pr, ui, s, c, i, a});
  if (isNaN(base)) {
    base = undefined;
  }

  return [vector, base];
};

/*
 * Parsing the CVSS v3.1 Vector to valid Metric Values and BaseScore
 * @param vector    a valid CVSS v3.1 vector:
 *                  CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:N
 * @return {}       if the vector is valid:
 *                  the different metric values and the calculated
 *                  v3.1 base score
 */
export const parseCvssV3BaseFromVector = vector => {
  if (!isDefined(vector) || vector.trim().length === 0) {
    return {};
  }

  let av;
  let attackVector;
  let ac;
  let attackComplexity;
  let pr;
  let privilegesRequired;
  let ui;
  let userInteraction;
  let s;
  let scope;
  let c;
  let confidentialityImpact;
  let i;
  let integrityImpact;
  let a;
  let availabilityImpact;

  const values = vector.split('/');

  for (const currentvalue of values) {
    let [metric, value] = currentvalue.split(':');

    metric = metric.toLowerCase();
    value = isDefined(value) ? value.toLowerCase() : '';

    switch (metric) {
      case 'av':
        if (value === 'l') {
          attackVector = 'LOCAL';
          av = 0.55;
        } else if (value === 'a') {
          attackVector = 'ADJACENT_NETWORK';
          av = 0.62;
        } else if (value === 'n') {
          attackVector = 'NETWORK';
          av = 0.85;
        } else if (value === 'p') {
          attackVector = 'PHYSICAL';
          av = 0.2;
        }
        break;
      case 'ac':
        if (value === 'h') {
          attackComplexity = 'HIGH';
          ac = 0.44;
        } else if (value === 'l') {
          attackComplexity = 'LOW';
          ac = 0.77;
        }
        break;
      case 'pr':
        if (value === 'h') {
          privilegesRequired = 'HIGH';
          pr = 0.27;
        } else if (value === 'l') {
          privilegesRequired = 'LOW';
          pr = 0.62;
        } else if (value === 'n') {
          privilegesRequired = 'NONE';
          pr = 0.85;
        }
        break;
      case 'ui':
        if (value === 'r') {
          userInteraction = 'REQUIRED';
          ui = 0.62;
        } else if (value === 'n') {
          userInteraction = 'NONE';
          ui = 0.85;
        }
        break;
      case 's':
        if (value === 'u') {
          scope = 'UNCHANGED';
          s = 6.42;
        } else if (value === 'c') {
          scope = 'CHANGED';
          s = 7.52;
        }
        break;
      case 'c':
        if (value === 'h') {
          confidentialityImpact = 'HIGH';
          c = 0.56;
        } else if (value === 'l') {
          confidentialityImpact = 'LOW';
          c = 0.22;
        } else if (value === 'n') {
          confidentialityImpact = 'NONE';
          c = 0.0;
        }
        break;
      case 'i':
        if (value === 'h') {
          integrityImpact = 'HIGH';
          i = 0.56;
        } else if (value === 'l') {
          integrityImpact = 'LOW';
          i = 0.22;
        } else if (value === 'n') {
          integrityImpact = 'NONE';
          i = 0.0;
        }
        break;
      case 'a':
        if (value === 'h') {
          availabilityImpact = 'HIGH';
          a = 0.56;
        } else if (value === 'l') {
          availabilityImpact = 'LOW';
          a = 0.22;
        } else if (value === 'n') {
          availabilityImpact = 'NONE';
          a = 0.0;
        }
        break;
      default:
        break;
    }
  }

  let base = V3ScoreBase({av, ac, pr, ui, s, c, i, a});
  if (isNaN(base)) {
    base = undefined;
  }

  return {
    attackVector,
    attackComplexity,
    privilegesRequired,
    userInteraction,
    scope,
    confidentialityImpact,
    integrityImpact,
    availabilityImpact,
    cvssScore: base,
  };
};

const roundUp = value => {
  const intput = Math.round(value * 100000);
  if (intput % 10000 === 0) {
    return intput / 100000;
  }
  return (Math.floor(intput / 10000) + 1) / 10;
};

const V3ScoreBase = ({av, ac, pr, ui, s, c, i, a} = {}) => {
  let impact = 1.0 - (1.0 - c) * (1.0 - i) * (1.0 - a);

  impact =
    s === 6.42
      ? s * impact
      : s * (impact - 0.029) - 3.25 * Math.pow(impact - 0.02, 15);
  if (s === 7.52) {
    if (pr === 0.62) {
      pr = 0.68;
    }
    if (pr === 0.27) {
      pr = 0.5;
    }
  }
  const exploitability = 8.22 * av * ac * pr * ui;
  if (impact <= 0) {
    return 0;
  }
  return s === 6.42
    ? roundUp(Math.min(exploitability + impact, 10))
    : roundUp(Math.min(1.08 * (exploitability + impact), 10));
};

// vim: set ts=2 sw=2 tw=80:

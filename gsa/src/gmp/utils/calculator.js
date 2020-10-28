/* Copyright (C) 2017-2020 Greenbone Networks GmbH
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

const toFixed1 = value => {
  let result = +(
    Math.round(+(value.toString() + 'e' + 1)).toString() +
    'e' +
    -1
  );
  // if no fractional part then add a .0 to the number
  if (result.toString().indexOf('.') == -1) result = result + '.0';
  return result;
};

export const parseCvssV2BaseVector = ({
  accessComplexity,
  accessVector,
  authentication,
  availabilityImpact,
  confidentialityImpact,
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
    return undefined;
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
    case 'NETWORK':
      vector += 'N';
      av = 1.0;
      break;
    case 'ADJACENT_NETWORK':
      vector += 'A';
      av = 0.646;
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
  let impact = toFixed1(10.41 * (1.0 - (1.0 - c) * (1.0 - i) * (1.0 - a)));
  if (impact > 10.0) {
    impact = 10.0;
  }
  let exploit = toFixed1(20 * ac * av * au);
  let f_impact = 0.0;
  if (impact !== 0.0) {
    f_impact = 1.176;
  }
  let base = toFixed1((0.6 * impact + 0.4 * exploit - 1.5) * f_impact);
  console.log(base);

  return vector;
};

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
    return undefined;
  }

  let vector = 'AV:';

  switch (attackVector) {
    case 'LOCAL':
      vector += 'L';
      break;
    case 'NETWORK':
      vector += 'N';
      break;
    case 'ADJACENT_NETWORK':
      vector += 'A';
      break;
    case 'PHYSICAL':
      vector += 'P';
      break;
    default:
      vector += 'ERROR';
  }

  vector += '/AC:';
  switch (attackComplexity) {
    case 'LOW':
      vector += 'L';
      break;
    case 'HIGH':
      vector += 'H';
      break;
    default:
      vector += 'ERROR';
  }

  vector += '/PR:';
  switch (privilegesRequired) {
    case 'NONE':
      vector += 'N';
      break;
    case 'LOW':
      vector += 'L';
      break;
    case 'HIGH':
      vector += 'H';
      break;
    default:
      vector += 'ERROR';
  }

  vector += '/UI:';
  switch (userInteraction) {
    case 'NONE':
      vector += 'N';
      break;
    case 'REQUIRED':
      vector += 'R';
      break;
    default:
      vector += 'ERROR';
  }

  vector += '/S:';
  switch (scope) {
    case 'UNCHANGED':
      vector += 'U';
      break;
    case 'CHANGED':
      vector += 'C';
      break;
    default:
      vector += 'ERROR';
  }

  vector += '/C:';
  switch (confidentialityImpact) {
    case 'NONE':
      vector += 'N';
      break;
    case 'LOW':
      vector += 'L';
      break;
    case 'HIGH':
      vector += 'H';
      break;
    default:
      vector += 'ERROR';
  }

  vector += '/I:';
  switch (integrityImpact) {
    case 'NONE':
      vector += 'N';
      break;
    case 'LOW':
      vector += 'L';
      break;
    case 'HIGH':
      vector += 'H';
      break;
    default:
      vector += 'ERROR';
  }

  vector += '/A:';
  switch (availabilityImpact) {
    case 'NONE':
      vector += 'N';
      break;
    case 'LOW':
      vector += 'L';
      break;
    case 'HIGH':
      vector += 'H';
      break;
    default:
      vector += 'ERROR';
  }
  return vector;
};

export const parseCvssV2BaseFromVector = vector => {
  if (!isDefined(vector) || vector.trim().length === 0) {
    return {};
  }

  let av;
  let ac;
  let au;
  let c;
  let i;
  let a;

  const values = vector.split('/');

  for (const currentvalue of values) {
    let [metric, value] = currentvalue.split(':');

    metric = metric.toLowerCase();
    value = isDefined(value) ? value.toLowerCase() : '';

    switch (metric) {
      case 'av':
        if (value === 'l') {
          av = 'LOCAL';
        } else if (value === 'a') {
          av = 'ADJACENT_NETWORK';
        } else if (value === 'n') {
          av = 'NETWORK';
        }
        break;
      case 'ac':
        if (value === 'h') {
          ac = 'HIGH';
        } else if (value === 'm') {
          ac = 'MEDIUM';
        } else if (value === 'l') {
          ac = 'LOW';
        }
        break;
      case 'au':
        if (value === 'm') {
          au = 'MULTIPLE_INSTANCES';
        } else if (value === 's') {
          au = 'SINGLE_INSTANCE';
        } else if (value === 'n') {
          au = 'NONE';
        }
        break;
      case 'c':
        if (value === 'c') {
          c = 'COMPLETE';
        } else if (value === 'p') {
          c = 'PARTIAL';
        } else if (value === 'n') {
          c = 'NONE';
        }
        break;
      case 'i':
        if (value === 'c') {
          i = 'COMPLETE';
        } else if (value === 'p') {
          i = 'PARTIAL';
        } else if (value === 'n') {
          i = 'NONE';
        }
        break;
      case 'a':
        if (value === 'c') {
          a = 'COMPLETE';
        } else if (value === 'p') {
          a = 'PARTIAL';
        } else if (value === 'n') {
          a = 'NONE';
        }
        break;
      default:
        break;
    }
  }

  return {
    accessVector: av,
    accessComplexity: ac,
    authentication: au,
    confidentialityImpact: c,
    integrityImpact: i,
    availabilityImpact: a,
  };
};

export const parseCvssV3BaseFromVector = vector => {
  if (!isDefined(vector) || vector.trim().length === 0) {
    return {};
  }

  let av;
  let ac;
  let pr;
  let ui;
  let s;
  let c;
  let i;
  let a;

  const values = vector.split('/');

  for (const currentvalue of values) {
    let [metric, value] = currentvalue.split(':');

    metric = metric.toLowerCase();
    value = isDefined(value) ? value.toLowerCase() : '';

    switch (metric) {
      case 'av':
        if (value === 'l') {
          av = 'LOCAL';
        } else if (value === 'a') {
          av = 'ADJACENT_NETWORK';
        } else if (value === 'n') {
          av = 'NETWORK';
        } else if (value === 'p') {
          av = 'PHYSICAL';
        }
        break;
      case 'ac':
        if (value === 'h') {
          ac = 'HIGH';
        } else if (value === 'l') {
          ac = 'LOW';
        }
        break;
      case 'pr':
        if (value === 'h') {
          pr = 'HIGH';
        } else if (value === 'l') {
          pr = 'LOW';
        } else if (value === 'n') {
          pr = 'NONE';
        }
        break;
      case 'ui':
        if (value === 'r') {
          ui = 'REQUIRED';
        } else if (value === 'n') {
          ui = 'NONE';
        }
        break;
      case 's':
        if (value === 'u') {
          s = 'UNCHANGED';
        } else if (value === 'c') {
          s = 'CHANGED';
        }
        break;
      case 'c':
        if (value === 'h') {
          c = 'HIGH';
        } else if (value === 'l') {
          c = 'LOW';
        } else if (value === 'n') {
          c = 'NONE';
        }
        break;
      case 'i':
        if (value === 'h') {
          i = 'HIGH';
        } else if (value === 'l') {
          i = 'LOW';
        } else if (value === 'n') {
          i = 'NONE';
        }
        break;
      case 'a':
        if (value === 'h') {
          a = 'HIGH';
        } else if (value === 'l') {
          a = 'LOW';
        } else if (value === 'n') {
          a = 'NONE';
        }
        break;
      default:
        break;
    }
  }

  return {
    attackVector: av,
    attackComplexity: ac,
    privilegesRequired: pr,
    userInteraction: ui,
    scope: s,
    confidentialityImpact: c,
    integrityImpact: i,
    availabilityImpact: a,
  };
};

const parseCIA = value => {
  switch (value) {
    case 'NONE':
      return 0.0;
    case 'LOW':
      return 0.22;
    case 'HIGH':
      return 0.56;
    default:
      return undefined;
  }
};

const parseAV = value => {
  switch (value) {
    case 'LOCAL':
      return 0.55;
    case 'NETWORK':
      return 0.85;
    case 'ADJACENT_NETWORK':
      return 0.62;
    case 'PHYSICAL':
      return 0.2;
    default:
      return undefined;
  }
};

const parseAC = value => {
  switch (value) {
    case 'LOW':
      return 0.44;
    case 'HIGH':
      return 0.77;
    default:
      return undefined;
  }
};

const parsePR = ({privilegesRequired, scope}) => {
  console.log('scope');
  console.log(scope);
  switch (privilegesRequired) {
    case 'NONE':
      return 0.85;
    case 'LOW':
      if (scope === 'CHANGED') {
        return 0.68;
      } else {
        return 0.62;
      }
    case 'HIGH':
      if (scope === 'CHANGED') {
        return 0.5;
      } else {
        return 0.27;
      }
    default:
      return undefined;
  }
};

const parseUI = value => {
  switch (value) {
    case 'NONE':
      return 0.85;
    case 'REQUIRED':
      return 0.62;
    default:
      return undefined;
  }
};

const roundUp = value => {
  var intput = Math.round(value * 100000);
  if (intput % 10000 === 0) {
    return intput / 100000;
  } else {
    return (Math.floor(intput / 10000) + 1) / 10;
  }
};

export const calculateV3Score = ({
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
    return undefined;
  }

  let c = parseCIA(confidentialityImpact);
  let i = parseCIA(integrityImpact);
  let a = parseCIA(availabilityImpact);

  let impact = 1.0 - (1.0 - c) * (1.0 - i) * (1.0 - a);

  switch (scope) {
    case 'UNCHANGED':
      impact = 6.42 * impact;
      break;
    case 'CHANGED':
      impact = 7.52 * impact - 3.25 * Math.pow(impact - 0.02, 15);
      break;
    default:
      return undefined;
  }
  let av = parseAV(attackVector);
  let ac = parseAC(attackComplexity);
  let pr = parsePR({privilegesRequired, scope});
  let ui = parseUI(userInteraction);
  let exploitability = 8.22 * av * ac * pr * ui;
  if (impact <= 0) {
    return 0;
  } else {
    switch (scope) {
      case 'UNCHANGED':
        return roundUp(Math.min(exploitability + impact, 10));
      case 'CHANGED':
        return roundUp(Math.min(1.08 * (exploitability + impact), 10));
      default:
        return undefined;
    }
  }
};

export const calculateV2Score = ({
  accessVector,
  accessComplexity,
  confidentialityImpact,
  authentication,
  integrityImpact,
  availabilityImpact,
} = {}) => {
  if (
    !isDefined(accessVector) &&
    !isDefined(accessComplexity) &&
    !isDefined(confidentialityImpact) &&
    !isDefined(authentication) &&
    !isDefined(integrityImpact) &&
    !isDefined(availabilityImpact)
  ) {
    return undefined;
  }
};

// vim: set ts=2 sw=2 tw=80:

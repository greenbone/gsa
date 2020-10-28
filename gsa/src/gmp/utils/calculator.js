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

const parseCIA = value => {
  switch (value) {
    case 'NONE':
      return 0.0;
    case 'LOW':
      return 0.275;
    case 'HIGH':
      return 0.66;
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

// vim: set ts=2 sw=2 tw=80:

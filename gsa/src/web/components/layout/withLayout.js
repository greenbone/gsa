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
import React from 'react';

import styled from 'styled-components';

import {map} from 'gmp/utils/array';
import {isDefined} from 'gmp/utils/identity';

import PropTypes from 'web/utils/proptypes';

const convertAlign = align => {
  switch (align) {
    case 'end':
    case 'start':
      return 'flex-' + align;
    default:
      return align;
  }
};

const withLayout = (defaults = {}) => Component => {
  const LayoutComponent = styled(
    ({align, basis, flex, grow, shrink, wrap, ...props}) => (
      <Component {...props} />
    ),
  )`
    display: flex;
    flex-direction: ${({flex = defaults.flex}) =>
      isDefined(flex) && flex !== true ? flex : 'row'};
    flex-basis: ${({basis = defaults.basis}) => basis};
    flex-grow: ${({grow = defaults.grow}) => (grow === true ? 1 : grow)};
    flex-wrap: ${({wrap = defaults.wrap}) => (wrap === true ? 'wrap' : wrap)};
    flex-shrink: ${({shrink = defaults.shrink}) =>
      shrink === true ? 1 : shrink};
    ${({flex = defaults.flex, align = defaults.align}) => {
      if (isDefined(align)) {
        align = map(align, al => convertAlign(al));
      } else {
        // use sane defaults for alignment
        align = flex === 'column' ? ['center', 'stretch'] : ['start', 'center'];
      }
      return {
        justifyContent: align[0],
        alignItems: align[1],
      };
    }}
  `;

  LayoutComponent.displayName = `withLayout(${Component.displayName})`;

  LayoutComponent.propTypes = {
    basis: PropTypes.string,
    flex: PropTypes.oneOf([true, 'column', 'row']),
    grow: PropTypes.oneOfType([
      PropTypes.oneOf([true]),
      PropTypes.numberOrNumberString,
    ]),
    shrink: PropTypes.oneOfType([
      PropTypes.oneOf([true]),
      PropTypes.numberOrNumberString,
    ]),
    wrap: PropTypes.oneOf([true, 'wrap', 'nowrap']),
  };

  return LayoutComponent;
};

export default withLayout;

// vim: set ts=2 sw=2 tw=80:

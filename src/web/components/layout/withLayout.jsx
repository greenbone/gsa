/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {map} from 'gmp/utils/array';
import {isDefined} from 'gmp/utils/identity';
import React from 'react';
import styled from 'styled-components';
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

const withLayout =
  (defaults = {}) =>
  Component => {
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
          align =
            flex === 'column' ? ['center', 'stretch'] : ['start', 'center'];
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

/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import hoistStatics from 'hoist-non-react-statics';
import React from 'react';


import SvgIcon from './svgicon';

const withSvgIcon =
  (defaults = {}) =>
  Component => {
    const SvgIconWrapper = props => (
      <SvgIcon {...defaults} {...props}>
        {svgProps => <Component {...svgProps} />}
      </SvgIcon>
    );
    return hoistStatics(SvgIconWrapper, Component);
  };

export default withSvgIcon;

// vim: set ts=2 sw=2 tw=80:

/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import SvgIcon from './svgicon';

import Icon from './svg/details.svg';

const DetailsIcon = props => (
  <SvgIcon {...props}>
    <Icon />
  </SvgIcon>
);

export default DetailsIcon;

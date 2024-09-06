/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import SvgIcon from './svgicon';

import {ZoomIn as Icon} from 'lucide-react';
import IconWithStrokeWidth from 'web/components/icon/IconWithStrokeWidth';

const DetailsIcon = props => (
  <SvgIcon {...props}>
    <IconWithStrokeWidth IconComponent={Icon} {...props} />
  </SvgIcon>
);

export default DetailsIcon;

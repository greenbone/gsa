/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {ZoomIn as Icon} from 'lucide-react';
import React from 'react';
import IconWithStrokeWidth from 'web/components/icon/IconWithStrokeWidth';

import SvgIcon from './svgicon';


const DetailsIcon = props => (
  <SvgIcon {...props}>
    <IconWithStrokeWidth IconComponent={Icon} {...props} data-testid="details-icon"/>
  </SvgIcon>
);

export default DetailsIcon;

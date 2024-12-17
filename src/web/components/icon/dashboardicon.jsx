/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */


import {BarChart3 as Icon} from 'lucide-react';
import IconWithStrokeWidth from 'web/components/icon/IconWithStrokeWidth';

import withSvgIcon from './withSvgIcon';

const DashboardIcon = withSvgIcon()(props => (
  <IconWithStrokeWidth IconComponent={Icon} {...props} data-testid="dashboard-icon"/>
));

export default DashboardIcon;

// vim: set ts=2 sw=2 tw=80:

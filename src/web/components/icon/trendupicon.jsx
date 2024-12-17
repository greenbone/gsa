/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Icon from './svg/trend_up.svg';
import withSvgIcon from './withSvgIcon';


const TrendUpIconComponent = withSvgIcon()(Icon);

const TrendUpIcon = props => (
  <TrendUpIconComponent {...props} data-testid="trend-up-icon" />
);

export default TrendUpIcon;

// vim: set ts=2 sw=2 tw=80:

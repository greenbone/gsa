/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import withSvgIcon from './withSvgIcon';

import Icon from './svg/trend_up.svg';

const TrendUpIconComponent = withSvgIcon()(Icon);

const TrendUpIcon = props => (
  <TrendUpIconComponent {...props} data-testid="trend-up-icon" />
);

export default TrendUpIcon;

// vim: set ts=2 sw=2 tw=80:

/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import withSvgIcon from './withSvgIcon';

import Icon from './svg/trend_nochange.svg';

const TrendNoChangeIconComponent = withSvgIcon()(Icon);

const TrendNoChangeIcon = props => (
  <TrendNoChangeIconComponent {...props} data-testid="trend-nochange-icon" />
);

export default TrendNoChangeIcon;

// vim: set ts=2 sw=2 tw=80:

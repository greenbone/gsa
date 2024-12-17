/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import withSvgIcon from './withSvgIcon';

import Icon from './svg/trend_more.svg';

const TrendMoreIconComponent = withSvgIcon()(Icon);

const TrendMoreIcon = props => (
  <TrendMoreIconComponent {...props} data-testid="trend-more-icon" />
);
export default TrendMoreIcon;

// vim: set ts=2 sw=2 tw=80:

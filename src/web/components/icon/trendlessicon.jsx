/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import withSvgIcon from './withSvgIcon';

import Icon from './svg/trend_less.svg';

const TrendLessIconComponent = withSvgIcon()(Icon);

const TrendLessIcon = props => (
  <TrendLessIconComponent {...props} data-testid="trend-less-icon" />
);

export default TrendLessIcon;

// vim: set ts=2 sw=2 tw=80:

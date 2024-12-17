/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Icon from './svg/trend_nochange.svg';
import withSvgIcon from './withSvgIcon';


const TrendNoChangeIconComponent = withSvgIcon()(Icon);

const TrendNoChangeIcon = props => (
  <TrendNoChangeIconComponent {...props} data-testid="trend-nochange-icon" />
);

export default TrendNoChangeIcon;

// vim: set ts=2 sw=2 tw=80:

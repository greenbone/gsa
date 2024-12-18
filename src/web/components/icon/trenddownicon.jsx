/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Icon from './svg/trend_down.svg';
import withSvgIcon from './withSvgIcon';

const TrendDownIconComponent = withSvgIcon()(Icon);

const TrendDownIcon = props => (
  <TrendDownIconComponent {...props} data-testid="trend-down-icon" />
);

export default TrendDownIcon;

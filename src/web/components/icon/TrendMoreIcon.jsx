/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Icon from './svg/trend_more.svg';
import withSvgIcon from './withSvgIcon';

const TrendMoreIconComponent = withSvgIcon()(Icon);

const TrendMoreIcon = props => (
  <TrendMoreIconComponent {...props} data-testid="trend-more-icon" />
);
export default TrendMoreIcon;

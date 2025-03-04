/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Icon from 'web/components/icon/svg/trend_more.svg';
import withSvgIcon from 'web/components/icon/withSvgIcon';

const TrendMoreIconComponent = withSvgIcon()(Icon);

const TrendMoreIcon = props => (
  <TrendMoreIconComponent data-testid="trend-more-icon" {...props} />
);
export default TrendMoreIcon;

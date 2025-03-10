/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Icon from 'web/components/icon/svg/trend_up.svg';
import withSvgIcon from 'web/components/icon/withSvgIcon';

const TrendUpIconComponent = withSvgIcon()(Icon);

const TrendUpIcon = props => (
  <TrendUpIconComponent data-testid="trend-up-icon" {...props} />
);

export default TrendUpIcon;

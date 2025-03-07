/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Icon from 'web/components/icon/svg/trend_down.svg';
import withSvgIcon from 'web/components/icon/withSvgIcon';

const TrendDownIconComponent = withSvgIcon()(Icon);

const TrendDownIcon = props => (
  <TrendDownIconComponent data-testid="trend-down-icon" {...props} />
);

export default TrendDownIcon;

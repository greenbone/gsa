/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Icon from './svg/radius.svg';
import withSvgIcon from './withSvgIcon';

const RadiusIconComponent = withSvgIcon()(Icon);

const RadiusIcon = props => (
  <RadiusIconComponent {...props} data-testid="radius-icon" />
);

export default RadiusIcon;

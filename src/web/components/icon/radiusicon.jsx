/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import withSvgIcon from './withSvgIcon';

import Icon from './svg/radius.svg';

const RadiusIconComponent = withSvgIcon()(Icon);

const RadiusIcon = props => (
  <RadiusIconComponent {...props} data-testid="radius-icon" />
);

export default RadiusIcon;

// vim: set ts=2 sw=2 tw=80:

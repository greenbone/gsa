/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import withSvgIcon from './withSvgIcon';

import Icon from './svg/override.svg';

const OverrideIconComponent = withSvgIcon()(Icon);

const OverrideIcon = props => (
  <OverrideIconComponent {...props} data-testid="override-icon" />
);
export default OverrideIcon;

// vim: set ts=2 sw=2 tw=80:

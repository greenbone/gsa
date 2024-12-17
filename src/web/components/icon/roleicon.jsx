/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import withSvgIcon from './withSvgIcon';

import Icon from './svg/role.svg';

const RoleIconComponent = withSvgIcon()(Icon);

const RoleIcon = props => (
  <RoleIconComponent {...props} data-testid="role-icon" />
);

export default RoleIcon;

// vim: set ts=2 sw=2 tw=80:

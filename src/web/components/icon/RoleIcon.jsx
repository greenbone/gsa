/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Icon from 'web/components/icon/svg/role.svg';
import withSvgIcon from 'web/components/icon/withSvgIcon';

const RoleIconComponent = withSvgIcon()(Icon);

const RoleIcon = props => (
  <RoleIconComponent {...props} data-testid="role-icon" />
);

export default RoleIcon;

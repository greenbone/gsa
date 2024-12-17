/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import withSvgIcon from './withSvgIcon';

import Icon from './svg/ldap.svg';

const LdapIconComponent = withSvgIcon()(Icon);

const LdapIcon = props => (
  <LdapIconComponent {...props} data-testid="ldap-icon" />
);

export default LdapIcon;

// vim: set ts=2 sw=2 tw=80:

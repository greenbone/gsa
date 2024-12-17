/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Icon from './svg/ldap.svg';
import withSvgIcon from './withSvgIcon';

const LdapIconComponent = withSvgIcon()(Icon);

const LdapIcon = props => (
  <LdapIconComponent {...props} data-testid="ldap-icon" />
);

export default LdapIcon;

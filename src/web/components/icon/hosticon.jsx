/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import withSvgIcon from './withSvgIcon';

import Icon from './svg/host.svg';

const HostIconComponent = withSvgIcon()(Icon);

const HostIcon = props => (
  <HostIconComponent {...props} data-testid="host-icon" />
);
export default HostIcon;

// vim: set ts=2 sw=2 tw=80:

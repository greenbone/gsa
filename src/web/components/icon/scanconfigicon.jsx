/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import withSvgIcon from './withSvgIcon';

import Icon from './svg/config.svg';

const ScanConfigIconComponent = withSvgIcon()(Icon);

const ScanConfigIcon = props => (
  <ScanConfigIconComponent {...props} data-testid="scan-config-icon" />
);

export default ScanConfigIcon;

// vim: set ts=2 sw=2 tw=80:

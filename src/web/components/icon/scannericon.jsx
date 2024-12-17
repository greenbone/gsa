/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import withSvgIcon from './withSvgIcon';

import Icon from './svg/scanner.svg';

const ScannerIconComponent = withSvgIcon()(Icon);

const ScannerIcon = props => (
  <ScannerIconComponent {...props} data-testid="scanner-icon" />
);

export default ScannerIcon;

// vim: set ts=2 sw=2 tw=80:

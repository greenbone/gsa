/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Icon from './svg/scanner.svg';
import withSvgIcon from './withSvgIcon';

const ScannerIconComponent = withSvgIcon()(Icon);

const ScannerIcon = props => (
  <ScannerIconComponent {...props} data-testid="scanner-icon" />
);

export default ScannerIcon;

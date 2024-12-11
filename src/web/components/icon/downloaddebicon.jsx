/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Icon from './svg/dl_deb.svg';
import withSvgIcon from './withSvgIcon';

const DownloadDebIconComponent = withSvgIcon()(Icon);

const DownloadDebIcon = props => (
  <DownloadDebIconComponent {...props} data-testid="download-deb-icon" />
);

export default DownloadDebIcon;

// vim: set ts=2 sw=2 tw=80:

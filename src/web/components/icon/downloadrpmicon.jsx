/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import withSvgIcon from './withSvgIcon';

import Icon from './svg/dl_rpm.svg';

const DownloadRpmIconComponent = withSvgIcon()(Icon);

const DownloadRpmIcon = props => (
  <DownloadRpmIconComponent {...props} data-testid="download-rpm-icon" />
);

export default DownloadRpmIcon;

// vim: set ts=2 sw=2 tw=80:

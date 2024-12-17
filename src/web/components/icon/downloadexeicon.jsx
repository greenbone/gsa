/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import withSvgIcon from './withSvgIcon';

import Icon from './svg/dl_exe.svg';

const DownloadExeIconComponent = withSvgIcon()(Icon);

const DownloadExeIcon = props => (
  <DownloadExeIconComponent {...props} data-testid="download-exe-icon" />
);

export default DownloadExeIcon;

// vim: set ts=2 sw=2 tw=80:

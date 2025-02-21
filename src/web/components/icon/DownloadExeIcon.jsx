/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Icon from 'web/components/icon/svg/dl_exe.svg';
import withSvgIcon from 'web/components/icon/withSvgIcon';

const DownloadExeIconComponent = withSvgIcon()(Icon);

const DownloadExeIcon = props => (
  <DownloadExeIconComponent {...props} data-testid="download-exe-icon" />
);

export default DownloadExeIcon;

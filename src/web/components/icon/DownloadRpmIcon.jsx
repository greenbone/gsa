/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Icon from './svg/dl_rpm.svg';
import withSvgIcon from './withSvgIcon';

const DownloadRpmIconComponent = withSvgIcon()(Icon);

const DownloadRpmIcon = props => (
  <DownloadRpmIconComponent {...props} data-testid="download-rpm-icon" />
);

export default DownloadRpmIcon;

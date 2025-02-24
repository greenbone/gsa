/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Icon from 'web/components/icon/svg/dl_key.svg';
import withSvgIcon from 'web/components/icon/withSvgIcon';

const DownloadKeyIconComponent = withSvgIcon()(Icon);

const DownloadKeyIcon = props => (
  <DownloadKeyIconComponent {...props} data-testid="download-key-icon" />
);

export default DownloadKeyIcon;

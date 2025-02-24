/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {_} from 'gmp/locale/lang';
import Icon from 'web/components/icon/svg/dl_svg.svg';
import withSvgIcon from 'web/components/icon/withSvgIcon';

const DownloadSvgIconComponent = withSvgIcon({
  title: _('Download SVG'),
})(Icon);

const DownloadSvgIcon = props => (
  <DownloadSvgIconComponent {...props} data-testid="download-svg-icon" />
);
export default DownloadSvgIcon;

/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {_} from 'gmp/locale/lang';

import Icon from './svg/dl_svg.svg';
import withSvgIcon from './withSvgIcon';

const DownloadSvgIconComponent = withSvgIcon({
  title: _('Download SVG'),
})(Icon);

const DownloadSvgIcon = props => (
  <DownloadSvgIconComponent {...props} data-testid="download-svg-icon" />
);
export default DownloadSvgIcon;

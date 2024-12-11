/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {_} from 'gmp/locale/lang';

import withSvgIcon from './withSvgIcon';

import Icon from './svg/dl_svg.svg';

const DownloadSvgIconComponent = withSvgIcon({
  title: _('Download SVG'),
})(Icon);

const DownloadSvgIcon = props => (
  <DownloadSvgIconComponent {...props} data-testid="download-svg-icon" />
);
export default DownloadSvgIcon;

// vim: set ts=2 sw=2 tw=80:

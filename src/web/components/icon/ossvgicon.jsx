/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import withSvgIcon from './withSvgIcon';

import Icon from './svg/os.svg';

const OsSvgIconComponent = withSvgIcon()(Icon);

const OsSvgIcon = props => (
  <OsSvgIconComponent {...props} data-testid="os-svg-icon" />
);

export default OsSvgIcon;

// vim: set ts=2 sw=2 tw=80:

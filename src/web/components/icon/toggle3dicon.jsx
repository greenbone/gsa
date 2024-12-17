/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Icon from './svg/toggle3d.svg';
import withSvgIcon from './withSvgIcon';


const Toggle3dIconComponent = withSvgIcon()(Icon);

const Toggle3dIcon = props => (
  <Toggle3dIconComponent {...props} data-testid="toggle-3d-icon" />
);

export default Toggle3dIcon;

// vim: set ts=2 sw=2 tw=80:

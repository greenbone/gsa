/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Icon from './svg/override.svg';
import withSvgIcon from './withSvgIcon';

const OverrideIconComponent = withSvgIcon()(Icon);

const OverrideIcon = props => (
  <OverrideIconComponent {...props} data-testid="override-icon" />
);
export default OverrideIcon;

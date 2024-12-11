/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import withSvgIcon from './withSvgIcon';

import Icon from './svg/st_nonavailable.svg';

const StNonAvailableIconComponent = withSvgIcon()(Icon);

const StNonAvailableIcon = props => (
  <StNonAvailableIconComponent {...props} data-testid="st-nonavailable-icon" />
);

export default StNonAvailableIcon;

// vim: set ts=2 sw=2 tw=80:

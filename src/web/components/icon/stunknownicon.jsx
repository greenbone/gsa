/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import withSvgIcon from './withSvgIcon';

import Icon from './svg/st_unknown.svg';

const StUnknownIconComponent = withSvgIcon()(Icon);

const StUnknownIcon = props => (
  <StUnknownIconComponent {...props} data-testid="st-unknown-icon" />
);

export default StUnknownIcon;

// vim: set ts=2 sw=2 tw=80:

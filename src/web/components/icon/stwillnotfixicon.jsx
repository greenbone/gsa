/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import withSvgIcon from './withSvgIcon';

import Icon from './svg/st_willnotfix.svg';

const StWillNotFixIconComponent = withSvgIcon()(Icon);

const StWillNotFixIcon = props => (
  <StWillNotFixIconComponent {...props} data-testid="st-willnotfix-icon" />
);

export default StWillNotFixIcon;

// vim: set ts=2 sw=2 tw=80:

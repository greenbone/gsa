/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Icon from './svg/st_unknown.svg';
import withSvgIcon from './withSvgIcon';

const StUnknownIconComponent = withSvgIcon()(Icon);

const StUnknownIcon = props => (
  <StUnknownIconComponent {...props} data-testid="st-unknown-icon" />
);

export default StUnknownIcon;

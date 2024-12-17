/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Icon from './svg/st_workaround.svg';
import withSvgIcon from './withSvgIcon';


const StWorkaroundIconComponent = withSvgIcon()(Icon);

const StWorkaroundIcon = props => (
  <StWorkaroundIconComponent {...props} data-testid="st-workaround-icon" />
);

export default StWorkaroundIcon;

// vim: set ts=2 sw=2 tw=80:

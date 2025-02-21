/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Icon from './svg/st_willnotfix.svg';
import withSvgIcon from './withSvgIcon';

const StWillNotFixIconComponent = withSvgIcon()(Icon);

const StWillNotFixIcon = props => (
  <StWillNotFixIconComponent {...props} data-testid="st-willnotfix-icon" />
);

export default StWillNotFixIcon;

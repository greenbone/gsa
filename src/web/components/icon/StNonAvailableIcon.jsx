/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Icon from 'web/components/icon/svg/st_nonavailable.svg';
import withSvgIcon from 'web/components/icon/withSvgIcon';

const StNonAvailableIconComponent = withSvgIcon()(Icon);

const StNonAvailableIcon = props => (
  <StNonAvailableIconComponent {...props} data-testid="st-nonavailable-icon" />
);

export default StNonAvailableIcon;

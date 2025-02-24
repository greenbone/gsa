/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Icon from 'web/components/icon/svg/st_workaround.svg';
import withSvgIcon from 'web/components/icon/withSvgIcon';

const StWorkaroundIconComponent = withSvgIcon()(Icon);

const StWorkaroundIcon = props => (
  <StWorkaroundIconComponent {...props} data-testid="st-workaround-icon" />
);

export default StWorkaroundIcon;

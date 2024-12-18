/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Icon from './svg/delta_second.svg';
import withSvgIcon from './withSvgIcon';

const DeltaSecondIconComponent = withSvgIcon()(Icon);

const DeltaSecondIcon = props => (
  <DeltaSecondIconComponent {...props} data-testid="delta-second-icon" />
);

export default DeltaSecondIcon;

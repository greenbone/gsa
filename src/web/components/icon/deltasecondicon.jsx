/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import withSvgIcon from './withSvgIcon';

import Icon from './svg/delta_second.svg';

const DeltaSecondIconComponent = withSvgIcon()(Icon);

const DeltaSecondIcon = props => (
  <DeltaSecondIconComponent {...props} data-testid="delta-second-icon" />
);

export default DeltaSecondIcon;

// vim: set ts=2 sw=2 tw=80:

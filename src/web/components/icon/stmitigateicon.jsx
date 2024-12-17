/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import withSvgIcon from './withSvgIcon';

import Icon from './svg/st_mitigate.svg';

const StMitigateIconComponent = withSvgIcon()(Icon);

const StMitigateIcon = props => (
  <StMitigateIconComponent {...props} data-testid="st-mitigate-icon" />
);

export default StMitigateIcon;

// vim: set ts=2 sw=2 tw=80:

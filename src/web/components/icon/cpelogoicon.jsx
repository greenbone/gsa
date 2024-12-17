/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Icon from './svg/cpe.svg';
import withSvgIcon from './withSvgIcon';


const CpeLogoIconComponent = withSvgIcon()(Icon);

const CpeLogoIcon = props => (
  <CpeLogoIconComponent {...props} data-testid="cpe-logo-icon" />
);

export default CpeLogoIcon;

// vim: set ts=2 sw=2 tw=80:

/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Icon from './svg/st_vendorfix.svg';
import withSvgIcon from './withSvgIcon';


const StVendorFixIconComponent = withSvgIcon()(Icon);

const StVendorFixIcon = props => (
  <StVendorFixIconComponent {...props} data-testid="st-vendorfix-icon" />
);

export default StVendorFixIcon;

// vim: set ts=2 sw=2 tw=80:

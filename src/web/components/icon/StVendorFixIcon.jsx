/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Icon from 'web/components/icon/svg/st_vendorfix.svg';
import withSvgIcon from 'web/components/icon/withSvgIcon';

const StVendorFixIconComponent = withSvgIcon()(Icon);

const StVendorFixIcon = props => (
  <StVendorFixIconComponent {...props} data-testid="st-vendorfix-icon" />
);

export default StVendorFixIcon;

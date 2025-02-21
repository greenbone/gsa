/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Icon from 'web/components/icon/svg/cpe.svg';
import withSvgIcon from 'web/components/icon/withSvgIcon';

const CpeLogoIconComponent = withSvgIcon()(Icon);

const CpeLogoIcon = props => (
  <CpeLogoIconComponent {...props} data-testid="cpe-logo-icon" />
);

export default CpeLogoIcon;

/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Icon from './svg/st_mitigate.svg';
import withSvgIcon from './withSvgIcon';

const StMitigateIconComponent = withSvgIcon()(Icon);

const StMitigateIcon = props => (
  <StMitigateIconComponent {...props} data-testid="st-mitigate-icon" />
);

export default StMitigateIcon;

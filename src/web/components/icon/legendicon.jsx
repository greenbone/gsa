/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Icon from './svg/legend.svg';
import withSvgIcon from './withSvgIcon';

const LegendIconComponent = withSvgIcon()(Icon);

const LegendIcon = props => (
  <LegendIconComponent {...props} data-testid="legend-icon" />
);

export default LegendIcon;

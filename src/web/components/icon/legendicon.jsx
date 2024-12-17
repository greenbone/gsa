/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import withSvgIcon from './withSvgIcon';

import Icon from './svg/legend.svg';

const LegendIconComponent = withSvgIcon()(Icon);

const LegendIcon = props => (
  <LegendIconComponent {...props} data-testid="legend-icon" />
);

export default LegendIcon;

// vim: set ts=2 sw=2 tw=80:

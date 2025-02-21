/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Icon from 'web/components/icon/svg/sensor.svg';
import withSvgIcon from 'web/components/icon/withSvgIcon';

const SensorIconComponent = withSvgIcon()(Icon);

const SensorIcon = props => (
  <SensorIconComponent {...props} data-testid="sensor-icon" />
);

export default SensorIcon;

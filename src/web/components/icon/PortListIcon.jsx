/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Icon from 'web/components/icon/svg/port_list.svg';
import withSvgIcon from 'web/components/icon/withSvgIcon';

const PortListIconComponent = withSvgIcon()(Icon);

const PortListIcon = props => (
  <PortListIconComponent {...props} data-testid="port-list-icon" />
);

export default PortListIcon;

/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Icon from './svg/port_list.svg';
import withSvgIcon from './withSvgIcon';


const PortListIconComponent = withSvgIcon()(Icon);

const PortListIcon = props => (
  <PortListIconComponent {...props} data-testid="port-list-icon" />
);

export default PortListIcon;

// vim: set ts=2 sw=2 tw=80:

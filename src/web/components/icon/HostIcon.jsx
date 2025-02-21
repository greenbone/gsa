/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Icon from 'web/components/icon/svg/host.svg';
import withSvgIcon from 'web/components/icon/withSvgIcon';

const HostIconComponent = withSvgIcon()(Icon);

const HostIcon = props => (
  <HostIconComponent {...props} data-testid="host-icon" />
);
export default HostIcon;

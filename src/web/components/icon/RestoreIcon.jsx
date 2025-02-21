/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Icon from 'web/components/icon/svg/restore.svg';
import withSvgIcon from 'web/components/icon/withSvgIcon';

const RestoreIconComponent = withSvgIcon()(Icon);

const RestoreIcon = props => (
  <RestoreIconComponent {...props} data-testid="restore-icon" />
);

export default RestoreIcon;

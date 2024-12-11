/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import withSvgIcon from './withSvgIcon';

import Icon from './svg/restore.svg';

const RestoreIconComponent = withSvgIcon()(Icon);

const RestoreIcon = props => (
  <RestoreIconComponent {...props} data-testid="restore-icon" />
);


export default RestoreIcon;

// vim: set ts=2 sw=2 tw=80:

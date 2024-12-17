/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import withSvgIcon from './withSvgIcon';

import Icon from './svg/remove_from_assets.svg';

const RemoveFromAssetsIconComponent = withSvgIcon()(Icon);

const RemoveFromAssetsIcon = props => (
  <RemoveFromAssetsIconComponent {...props} data-testid="remove-from-assets-icon" />
);

export default RemoveFromAssetsIcon;

// vim: set ts=2 sw=2 tw=80:

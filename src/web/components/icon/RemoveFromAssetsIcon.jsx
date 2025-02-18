/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Icon from './svg/remove_from_assets.svg';
import withSvgIcon from './withSvgIcon';

const RemoveFromAssetsIconComponent = withSvgIcon()(Icon);

const RemoveFromAssetsIcon = props => (
  <RemoveFromAssetsIconComponent
    {...props}
    data-testid="remove-from-assets-icon"
  />
);

export default RemoveFromAssetsIcon;

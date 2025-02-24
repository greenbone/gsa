/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Icon from 'web/components/icon/svg/add_to_assets.svg';
import withSvgIcon from 'web/components/icon/withSvgIcon';

const AddToAssetsIconComponent = withSvgIcon()(Icon);

const AddToAssetsIcon = props => (
  <AddToAssetsIconComponent {...props} data-testid="add-to-assets-icon" />
);

export default AddToAssetsIcon;

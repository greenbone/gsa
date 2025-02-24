/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Icon from 'web/components/icon/svg/new_override.svg';
import withSvgIcon from 'web/components/icon/withSvgIcon';

const NewOverrideIconComponent = withSvgIcon()(Icon);

const NewOverrideIcon = props => (
  <NewOverrideIconComponent {...props} data-testid="new-override-icon" />
);

export default NewOverrideIcon;

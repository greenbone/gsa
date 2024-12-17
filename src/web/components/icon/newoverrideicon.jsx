/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Icon from './svg/new_override.svg';
import withSvgIcon from './withSvgIcon';


const NewOverrideIconComponent = withSvgIcon()(Icon);

const NewOverrideIcon = props => (
  <NewOverrideIconComponent {...props} data-testid="new-override-icon" />
);

export default NewOverrideIcon;

// vim: set ts=2 sw=2 tw=80:

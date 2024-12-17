/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Icon from './svg/new.svg';
import withSvgIcon from './withSvgIcon';


const NewIconComponent = withSvgIcon()(Icon);

const NewIcon = props => (
  <NewIconComponent {...props} data-testid="new-icon" />
);

export default NewIcon;

// vim: set ts=2 sw=2 tw=80:

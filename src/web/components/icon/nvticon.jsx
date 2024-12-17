/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Icon from './svg/nvt.svg';
import withSvgIcon from './withSvgIcon';


const NvtIconComponent = withSvgIcon()(Icon);

const NvtIcon = props => (
  <NvtIconComponent {...props} data-testid="nvt-icon" />
);

export default NvtIcon;

// vim: set ts=2 sw=2 tw=80:

/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Icon from './svg/clone.svg';
import withSvgIcon from './withSvgIcon';


const CloneIconComponent = withSvgIcon()(Icon);

const CloneIcon = props => <CloneIconComponent {...props} data-testid="clone-icon" />;

export default CloneIcon;

// vim: set ts=2 sw=2 tw=80:

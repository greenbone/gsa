/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Icon from 'web/components/icon/svg/clone.svg';
import withSvgIcon from 'web/components/icon/withSvgIcon';

const CloneIconComponent = withSvgIcon()(Icon);

const CloneIcon = props => (
  <CloneIconComponent data-testid="clone-icon" {...props} />
);

export default CloneIcon;

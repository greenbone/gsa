/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Icon from 'web/components/icon/svg/delta.svg';
import withSvgIcon from 'web/components/icon/withSvgIcon';

const DeltaIconComponent = withSvgIcon()(Icon);

const DeltaIcon = props => (
  <DeltaIconComponent {...props} data-testid="delta-icon" />
);

export default DeltaIcon;

/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Icon from 'web/components/icon/svg/provide_view.svg';
import withSvgIcon from 'web/components/icon/withSvgIcon';

const ProvideViewIconComponent = withSvgIcon()(Icon);

const ProvideViewIcon = props => (
  <ProvideViewIconComponent {...props} data-testid="provide-view-icon" />
);

export default ProvideViewIcon;

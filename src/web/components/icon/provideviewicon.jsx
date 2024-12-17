/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import withSvgIcon from './withSvgIcon';

import Icon from './svg/provide_view.svg';

const ProvideViewIconComponent = withSvgIcon()(Icon);

const ProvideViewIcon = props => (
  <ProvideViewIconComponent {...props} data-testid="provide-view-icon" />
);

export default ProvideViewIcon;

// vim: set ts=2 sw=2 tw=80:

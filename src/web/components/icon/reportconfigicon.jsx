/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import withSvgIcon from './withSvgIcon';

import Icon from './svg/report_format.svg';

const ReportConfigIconComponent = withSvgIcon()(Icon);

const ReportConfigIcon = props => (
  <ReportConfigIconComponent {...props} data-testid="report-config-icon" />
);

export default ReportConfigIcon;

// vim: set ts=2 sw=2 tw=80:

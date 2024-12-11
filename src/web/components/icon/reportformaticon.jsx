/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import withSvgIcon from './withSvgIcon';

import Icon from './svg/report_format.svg';

const ReportFormatIconComponent = withSvgIcon()(Icon);

const ReportFormatIcon = props => (
  <ReportFormatIconComponent {...props} data-testid="report-format-icon" />
);

export default ReportFormatIcon;

// vim: set ts=2 sw=2 tw=80:

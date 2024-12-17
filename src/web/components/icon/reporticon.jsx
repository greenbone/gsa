/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import withSvgIcon from './withSvgIcon';

import Icon from './svg/report.svg';

const ReportIconComponent = withSvgIcon()(Icon);

const ReportIcon = props => (
  <ReportIconComponent {...props} data-testid="report-icon" />
);

export default ReportIcon;

// vim: set ts=2 sw=2 tw=80:

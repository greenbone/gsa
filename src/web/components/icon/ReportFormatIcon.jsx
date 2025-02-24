/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Icon from 'web/components/icon/svg/report_format.svg';
import withSvgIcon from 'web/components/icon/withSvgIcon';

const ReportFormatIconComponent = withSvgIcon()(Icon);

const ReportFormatIcon = props => (
  <ReportFormatIconComponent {...props} data-testid="report-format-icon" />
);

export default ReportFormatIcon;

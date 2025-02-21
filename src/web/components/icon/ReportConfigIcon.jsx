/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Icon from 'web/components/icon/svg/report_format.svg';
import withSvgIcon from 'web/components/icon/withSvgIcon';

const ReportConfigIconComponent = withSvgIcon()(Icon);

const ReportConfigIcon = props => (
  <ReportConfigIconComponent {...props} data-testid="report-config-icon" />
);

export default ReportConfigIcon;

/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Icon from 'web/components/icon/svg/report.svg';
import withSvgIcon from 'web/components/icon/withSvgIcon';

const ReportIconComponent = withSvgIcon()(Icon);

const ReportIcon = props => (
  <ReportIconComponent {...props} data-testid="report-icon" />
);

export default ReportIcon;

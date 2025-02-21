/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Icon from 'web/components/icon/svg/cvss_calculator.svg';
import withSvgIcon from 'web/components/icon/withSvgIcon';

const CvssIconComponent = withSvgIcon()(Icon);

const CvssIcon = props => (
  <CvssIconComponent {...props} data-testid="cvss-icon" />
);

export default CvssIcon;

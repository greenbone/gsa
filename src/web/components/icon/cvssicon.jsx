/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Icon from './svg/cvss_calculator.svg';
import withSvgIcon from './withSvgIcon';


const CvssIconComponent = withSvgIcon()(Icon);

const CvssIcon = props => (
  <CvssIconComponent {...props} data-testid="cvss-icon" />
);

export default CvssIcon;

// vim: set ts=2 sw=2 tw=80:

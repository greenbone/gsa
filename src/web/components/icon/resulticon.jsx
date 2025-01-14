/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Icon from './svg/result.svg';
import withSvgIcon from './withSvgIcon';

const ResultIconComponent = withSvgIcon()(Icon);

const ResultIcon = props => (
  <ResultIconComponent {...props} data-testid="result-icon" />
);

export default ResultIcon;

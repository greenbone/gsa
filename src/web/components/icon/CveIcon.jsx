/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Icon from 'web/components/icon/svg/cve.svg';
import withSvgIcon from 'web/components/icon/withSvgIcon';

const CveIconComponent = withSvgIcon()(Icon);

const CveIcon = props => <CveIconComponent {...props} data-testid="cve-icon" />;

export default CveIcon;

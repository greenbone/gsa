/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Icon from 'web/components/icon/svg/nvt.svg';
import withSvgIcon from 'web/components/icon/withSvgIcon';

const NvtIconComponent = withSvgIcon()(Icon);

const NvtIcon = props => <NvtIconComponent {...props} data-testid="nvt-icon" />;

export default NvtIcon;

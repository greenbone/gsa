/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Icon from 'web/components/icon/svg/new.svg';
import withSvgIcon from 'web/components/icon/withSvgIcon';

const NewIconComponent = withSvgIcon()(Icon);

const NewIcon = props => <NewIconComponent data-testid="new-icon" {...props} />;

export default NewIcon;

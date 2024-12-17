/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import withComponentDefaults from 'web/utils/withComponentDefaults';

import Divider from './divider';

const IconDivider = withComponentDefaults({margin: '5px'})(Divider);

IconDivider.displayName = 'IconDivider';

export default IconDivider;

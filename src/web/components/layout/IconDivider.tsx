/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Divider, {DividerProps} from 'web/components/layout/Divider';
import withComponentDefaults from 'web/utils/withComponentDefaults';

const IconDivider = withComponentDefaults<DividerProps>({margin: '5px'})(
  Divider,
);

IconDivider.displayName = 'IconDivider';

export default IconDivider;

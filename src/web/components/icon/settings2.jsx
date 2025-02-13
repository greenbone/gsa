/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {Settings2 as Icon} from 'lucide-react';
import IconWithStrokeWidth from 'web/components/icon/IconWithStrokeWidth';

import withSvgIcon from './withSvgIcon';

const Settings2 = withSvgIcon()(props => (
  <IconWithStrokeWidth
    {...props}
    IconComponent={Icon}
    data-testid="settings-2-icon"
  />
));

export default Settings2;

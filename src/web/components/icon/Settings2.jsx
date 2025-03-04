/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {Settings2 as Icon} from 'lucide-react';
import IconWithStrokeWidth from 'web/components/icon/IconWithStrokeWidth';
import withSvgIcon from 'web/components/icon/withSvgIcon';

const Settings2Component = withSvgIcon()(props => (
  <IconWithStrokeWidth {...props} IconComponent={Icon} />
));

const Settings2 = props => (
  <Settings2Component data-testid="settings-2-icon" {...props} />
);

export default Settings2;

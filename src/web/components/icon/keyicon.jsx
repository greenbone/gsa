/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */


import {Key as Icon} from 'lucide-react';
import IconWithStrokeWidth from 'web/components/icon/IconWithStrokeWidth';

import withSvgIcon from './withSvgIcon';

const KeyIcon = withSvgIcon()(props => (
  <IconWithStrokeWidth IconComponent={Icon} {...props} data-testid="key-icon"/>
));

export default KeyIcon;

// vim: set ts=2 sw=2 tw=80:

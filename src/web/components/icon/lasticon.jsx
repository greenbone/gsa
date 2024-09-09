/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import withSvgIcon from './withSvgIcon';

import {ChevronLast as Icon} from 'lucide-react';

import IconWithStrokeWidth from 'web/components/icon/IconWithStrokeWidth';

const LastIcon = withSvgIcon()(props => (
  <IconWithStrokeWidth IconComponent={Icon} {...props} />
));

export default LastIcon;

// vim: set ts=2 sw=2 tw=80:

/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {RotateCcw as Icon} from 'lucide-react';
import IconWithStrokeWidth from 'web/components/icon/IconWithStrokeWidth';
import withSvgIcon from 'web/components/icon/withSvgIcon';

const ResetIconComponent = withSvgIcon()(props => (
  <IconWithStrokeWidth IconComponent={Icon} {...props} />
));

const ResetIcon = props => (
  <ResetIconComponent data-testid="reset-icon" {...props} />
);

export default ResetIcon;

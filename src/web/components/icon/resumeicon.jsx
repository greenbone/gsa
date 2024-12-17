/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */


import {StepForward as Icon} from 'lucide-react';
import IconWithStrokeWidth from 'web/components/icon/IconWithStrokeWidth';

import withSvgIcon from './withSvgIcon';

const ResumeIcon = withSvgIcon()(props => (
  <IconWithStrokeWidth IconComponent={Icon} {...props} data-testid="resume-icon"/>
));

export default ResumeIcon;

// vim: set ts=2 sw=2 tw=80:

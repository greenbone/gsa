/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {Pencil as Icon} from 'lucide-react';
import IconWithStrokeWidth from 'web/components/icon/IconWithStrokeWidth';
import withSvgIcon from 'web/components/icon/withSvgIcon';

const EditIconComponent = withSvgIcon()(props => (
  <IconWithStrokeWidth IconComponent={Icon} {...props} />
));

const EditIcon = props => (
  <EditIconComponent data-testid="edit-icon" {...props} />
);

export default EditIcon;

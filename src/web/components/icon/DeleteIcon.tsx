/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {isDefined} from 'gmp/utils/identity';
import {CircleX as Icon} from 'lucide-react';
import useTranslation from 'src/web/hooks/useTranslation';
import {DynamicIcon, DynamicIconProps} from 'web/components/icon/DynamicIcon';
import SelectionType from 'web/utils/SelectionType';

export interface DeleteIconProps<TValue = string>
  extends Omit<DynamicIconProps<TValue>, 'icon'> {
  selectionType?: keyof typeof SelectionType;
  title?: string;
}

function DeleteIcon<TValue = string>({
  selectionType,
  title,
  ...props
}: Readonly<DeleteIconProps<TValue>>): React.ReactNode {
  const [_] = useTranslation();
  if (!isDefined(title)) {
    if (selectionType === SelectionType.SELECTION_PAGE_CONTENTS) {
      title = _('Delete page contents');
    } else if (selectionType === SelectionType.SELECTION_USER) {
      title = _('Delete selection');
    } else if (selectionType === SelectionType.SELECTION_FILTER) {
      title = _('Delete all filtered');
    }
  }
  return (
    <DynamicIcon<TValue>
      dataTestId="delete-icon"
      icon={Icon}
      title={title}
      {...props}
    />
  );
}

export default DeleteIcon;

/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {isDefined} from 'gmp/utils/identity';
import {CircleXIcon} from 'web/components/icon';
import {DynamicIconProps} from 'web/components/icon/DynamicIcon';
import useTranslation from 'web/hooks/useTranslation';
import SelectionType from 'web/utils/SelectionType';

export interface DeleteIconProps<TValue = string>
  extends Omit<DynamicIconProps<TValue>, 'icon'> {
  selectionType?: keyof typeof SelectionType;
  title?: string;
  loading?: boolean;
}

function DeleteIcon<TValue = string>({
  selectionType,
  title,
  loading = false,
  ...props
}: Readonly<DeleteIconProps<TValue>>): React.ReactNode {
  const [_] = useTranslation();
  if (!isDefined(title)) {
    if (loading) {
      title = _('Deleting');
    } else if (selectionType === SelectionType.SELECTION_PAGE_CONTENTS) {
      title = _('Delete page contents');
    } else if (selectionType === SelectionType.SELECTION_USER) {
      title = _('Delete selection');
    } else if (selectionType === SelectionType.SELECTION_FILTER) {
      title = _('Delete all filtered');
    }
  }
  return (
    <CircleXIcon
      data-testid="delete-icon"
      loading={loading}
      title={title}
      {...props}
    />
  );
}

export default DeleteIcon;

/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {isDefined} from 'gmp/utils/identity';
import {TagsIcon as TagsSvgIcon} from 'web/components/icon';
import {ExtendedDynamicIconProps} from 'web/components/icon/createIconComponents';
import useTranslation from 'web/hooks/useTranslation';
import SelectionType, {SelectionTypeType} from 'web/utils/SelectionType';

interface TagsIconProps<TValue = string>
  extends ExtendedDynamicIconProps<TValue> {
  active?: boolean;
  selectionType?: SelectionTypeType;
  title?: string;
}

const TagsIcon = <TValue = string,>({
  active = true,
  'data-testid': dataTestId = 'tags-icon',
  selectionType,
  title,
  ...other
}: TagsIconProps<TValue>) => {
  const [_] = useTranslation();
  if (!isDefined(title)) {
    if (selectionType === SelectionType.SELECTION_PAGE_CONTENTS) {
      title = _('Add tag to page contents');
    } else if (selectionType === SelectionType.SELECTION_USER) {
      title = _('Add tag to selection');
    } else if (selectionType === SelectionType.SELECTION_FILTER) {
      title = _('Add tag to filtered');
    }
  }
  return (
    <TagsSvgIcon
      {...other}
      active={active}
      data-testid={dataTestId}
      title={title}
    />
  );
};

export default TagsIcon;

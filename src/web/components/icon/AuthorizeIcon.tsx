/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {isDefined} from 'gmp/utils/identity';
import {CirclePlusIcon as CirclePlusSvgIcon} from 'web/components/icon';
import {type ExtendedDynamicIconProps} from 'web/components/icon/createIconComponents';
import useTranslation from 'web/hooks/useTranslation';
import SelectionType, {type SelectionTypeType} from 'web/utils/SelectionType';

interface AuthorizeIconProps<TValue = string>
  extends ExtendedDynamicIconProps<TValue> {
  active?: boolean;
  selectionType?: SelectionTypeType;
  title?: string;
}

const AuthorizeIcon = <TValue = string,>({
  active = true,
  'data-testid': dataTestId = 'circle-plus-icon',
  selectionType,
  title,
  ...other
}: AuthorizeIconProps<TValue>) => {
  const [_] = useTranslation();

  if (!isDefined(title)) {
    if (selectionType === SelectionType.SELECTION_PAGE_CONTENTS) {
      title = _('Authorize all items on this page');
    } else if (selectionType === SelectionType.SELECTION_USER) {
      title = _('Authorize selected items');
    } else if (selectionType === SelectionType.SELECTION_FILTER) {
      title = _('Authorize all filtered items');
    }
  }

  return (
    <CirclePlusSvgIcon
      {...other}
      active={active}
      data-testid={dataTestId}
      title={title}
    />
  );
};

export default AuthorizeIcon;
